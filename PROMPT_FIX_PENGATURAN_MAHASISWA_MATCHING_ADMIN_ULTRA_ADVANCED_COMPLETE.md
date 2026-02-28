# 🎯 PROMPT MASTER 2000+ LINES: PENGATURAN MAHASISWA - MATCHING ADMIN DASHBOARD + ULTRA ADVANCED INNOVATION

## 1. EXECUTIVE SUMMARY

Dokumen ini adalah prompt implementasi super lengkap untuk merapikan dan mengembangkan Menu Pengaturan Mahasiswa agar:

- 100% visual matching dengan Dashboard Admin
- bebas dummy data
- stabil di mobile
- memiliki inovasi signifikan di UX, personalisasi, keamanan, automasi, serta kualitas operasional
- memiliki standar penulisan materi yang rapi, konsisten, dan satu tema

Target akhir:

1. Pengaturan Mahasiswa setara kualitas premium dengan halaman admin terbaik.
2. Semua konten berbahasa Indonesia yang konsisten dan profesional.
3. Semua data utama bersumber dari backend real-time atau persisted state (bukan fake/hardcoded).
4. Halaman ringan, responsif, dapat dipelihara jangka panjang, dan siap scale.

---

## 2. SCOPE

### 2.1 Frontend Core

- `resources/js/pages/student/settings.tsx`
- `resources/js/components/settings/settings-sidebar.tsx`
- `resources/js/components/settings/general-settings.tsx`
- `resources/js/components/settings/notification-settings.tsx`
- `resources/js/components/settings/appearance-settings.tsx`
- `resources/js/components/settings/privacy-settings.tsx`
- `resources/js/components/settings/security-settings.tsx`
- `resources/js/components/settings/data-management-settings.tsx`
- `resources/js/components/settings/SaveButton.tsx`
- `resources/js/components/settings/SettingsCard.tsx`
- `resources/js/components/settings/Toast.tsx`
- `resources/js/components/settings/AnimatedToggle.tsx`

### 2.2 Frontend Data Layer

- `resources/js/lib/settings-api.ts`
- `resources/js/types/settings.ts`
- optional: `resources/js/services/settings-service.ts`

### 2.3 Backend/API

- `app/Http/Controllers/Api/SettingsController.php`
- optional service: `app/Services/PreferenceManagerService.php`
- `routes/api.php`

### 2.4 Optional Data Persistence

- `user_preferences` table (already existing, verify schema)
- audit trail / change history table jika belum ada

---

## 3. NON-NEGOTIABLE GOALS

1. Hilangkan container icon pada header.
2. Hilangkan animasi icon melayang/naik turun di header.
3. Samakan tone warna dengan dashboard admin:
   - glassmorphism
   - border white alpha
   - gradient indigo-purple-pink
4. Tombol kembali disamakan seperti menu detail lain.
5. UI mobile rapi (no overflow/no clipping/no awkward stacking).
6. No dummy data untuk storage/security/session/history.
7. Konsistensi copywriting 1 tema.
8. Tambahkan inovasi signifikan (bukan visual saja).

---

## 4. DESIGN SYSTEM WAJIB

### 4.1 Color Tokens

```ts
const tokens = {
  container: 'bg-white/40 dark:bg-neutral-900/40',
  border: 'border-white/20 dark:border-white/5',
  textPrimary: 'text-neutral-900 dark:text-white',
  textSecondary: 'text-neutral-500 dark:text-neutral-400',
  headerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
};
```

### 4.2 Surface Rules

- Main cards: `rounded-3xl shadow-xl backdrop-blur-xl`
- Inner cards: `rounded-2xl`
- Section icon capsule: optional, subtle, not visually noisy

### 4.3 Motion Rules

- spring base: `stiffness: 300`, `damping: 20`
- card hover: `scale: 1.04`, `y: -4`, `stiffness: 400`, `damping: 15`
- no random infinite floating icon motion

### 4.4 Typography Rules

- Header title: `text-2xl sm:text-3xl font-bold`
- Section title: `text-lg font-semibold`
- Body: `text-sm sm:text-base`
- Helper text: `text-xs text-neutral-500`

### 4.5 Spacing Rules

- page padding: `p-4 md:p-6 lg:p-8`
- section spacing: `space-y-6 md:space-y-8`
- grid gaps: `gap-4 md:gap-6`

---

## 5. HEADER SPECIFICATION (STRICT)

Gunakan pola berikut:

```tsx
<motion.div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-2xl">
  <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

  <div className="relative">
    <motion.button className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:text-white">
      <ArrowLeft className="h-4 w-4" />
      Kembali
    </motion.button>

    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
        <motion.div className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24">
          <img className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium tracking-wide text-indigo-100">Pengaturan</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Kelola Preferensi</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">Atur pengalaman belajar, privasi, keamanan, dan data Anda.</p>
        </div>
      </div>

      <div className="w-full sm:w-auto">...</div>
    </div>
  </div>
</motion.div>
```

### Header Critical Constraints

- DILARANG: icon header dibungkus box `bg-white/20 + border`.
- DILARANG: floating icon animation array map.
- DILARANG: spinner icon besar di background header.

---

## 6. BACK BUTTON STANDARD

Harus sama gaya dengan detail menu lain:

- Rounded: `rounded-xl`
- Background: `bg-white/10`
- Border: `border-white/20`
- Backdrop: `backdrop-blur-sm`
- Text: `text-white/90`

Label yang dipakai:

- `Kembali` (umum)
- atau `Kembali ke Dashboard` jika konteks jelas

---

## 7. MOBILE-FIRST MANDATORY UX

### 7.1 Header

- icon + title stack di mobile
- action button tidak boleh memaksa overflow horizontal
- text center di mobile, left di sm+

### 7.2 Sidebar + Content

- mobile: sidebar collapse/tabs style
- desktop: sidebar tetap kiri
- no sticky element yang mengganggu viewport kecil

### 7.3 Buttons

- minimum height 44px
- area klik nyaman
- state loading jelas

### 7.4 Inputs

- no clipped label
- helper text tetap terbaca
- spacing cukup untuk keyboard mobile

---

## 8. NO DUMMY DATA POLICY

### 8.1 Forbidden

Dilarang hardcode data berikut untuk runtime production:

- storage usage fake
- active sessions fake
- login history fake
- terminate session fake timeout

### 8.2 Required Real Endpoints

- `GET /api/settings`
- `PATCH /api/settings/:category`
- `POST /api/settings/reset`
- `GET /api/settings/storage-usage`
- `GET /api/settings/security/active-sessions`
- `GET /api/settings/security/login-history`
- `POST /api/settings/security/terminate-session`
- `POST /api/settings/export`
- `POST /api/settings/import`
- `POST /api/settings/cache/clear`

### 8.3 Fallback Behavior

Jika endpoint gagal:

1. tampilkan state error friendly,
2. tampilkan retry,
3. jangan tampilkan angka bohong.

---

## 9. CONTENT STYLE GUIDE (SATU TEMA)

### 9.1 Tone

- ramah
- jelas
- profesional
- tidak bertele-tele

### 9.2 Terminologi Konsisten

Gunakan:

- Pengaturan
- Notifikasi
- Tampilan
- Privasi
- Keamanan
- Manajemen Data

Hindari campur aduk:

- Settings, preference, customize, manage data (jika ada padanan Indonesia)

### 9.3 CTA Dictionary

- Simpan Perubahan
- Reset Pengaturan
- Hapus Cache
- Unduh Data
- Impor Pengaturan
- Keluar dari Sesi

### 9.4 Microcopy Principles

- Judul max 4 kata
- Subteks max 2 kalimat
- 1 kalimat = 1 ide
- Gunakan kata kerja aktif

---

## 10. INNOVATION LAYER (SIGNIFICANT)

### 10.1 Settings Health Score

Tambahkan skor kesehatan pengaturan (0-100) berdasarkan:

- keamanan akun
- kelengkapan privasi
- konfigurasi notifikasi penting
- kebersihan sesi aktif

Kategori:

- 90-100: Excellent
- 75-89: Good
- 60-74: Fair
- <60: Needs Attention

### 10.2 Smart Presets

Preset 1 klik:

- Fokus Belajar
- Privasi Maksimal
- Hemat Data
- Notifikasi Penting Saja

### 10.3 Change Timeline

Riwayat perubahan settings:

- apa yang berubah
- kapan
- perangkat/browser
- rollback option untuk beberapa setting kritikal

### 10.4 Dependency Guard

Jika user mematikan setting kritis:

- tampilkan warning dampak
- minta konfirmasi ekstra

Contoh:

- mematikan reminder deadline tugas → warning risiko lupa tugas

### 10.5 Smart Recommendation

Rekomendasi otomatis:

- “Aktifkan notifikasi deadline untuk menghindari keterlambatan.”
- “Aktifkan verifikasi 2 langkah untuk meningkatkan keamanan akun.”

### 10.6 One-Click Recovery

Tambah tombol:

- Pulihkan Pengaturan Aman
- Pulihkan Pengaturan Standar

### 10.7 Device Trust Center

Halaman mini dalam security:

- daftar perangkat terpercaya
- revoke device
- mark current device trusted

### 10.8 Data Footprint Visualizer

Tampilkan breakdown storage:

- dokumen
- cache
- media
- backup

Dengan progress bar + estimasi penghematan bila dibersihkan.

### 10.9 Quiet Hours Intelligence

Sistem jam tenang:

- jadwal otomatis berdasarkan pola aktivitas user
- override manual

### 10.10 Accessibility Booster

Toggle cepat:

- font lebih besar
- kontras tinggi
- reduce motion
- fokus mode

---

## 11. INFORMATION ARCHITECTURE

Struktur kategori disarankan:

1. Umum
2. Notifikasi
3. Tampilan
4. Privasi
5. Keamanan
6. Data
7. Aksesibilitas (baru)
8. Preset (baru)
9. Riwayat Perubahan (baru)

---

## 12. COMPONENT CONTRACTS

### 12.1 SettingsShell

Props:

- `title`
- `subtitle`
- `icon`
- `onBack`
- `rightAction`

### 12.2 SettingsSectionCard

Props:

- `title`
- `description`
- `icon`
- `tone`
- `children`

### 12.3 SaveStateBanner

States:

- idle
- saving
- saved
- error

### 12.4 SettingsHealthWidget

Props:

- `score`
- `issues`
- `suggestions`

---

## 13. DATA MODELS

```ts
export interface UserSettings {
  general: {
    language: string;
    timezone: string;
    weekStartsOn: 'monday' | 'sunday';
  };
  notifications: {
    taskDeadline: boolean;
    classReminder: boolean;
    kasReminder: boolean;
    securityAlerts: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact';
    reduceMotion: boolean;
    highContrast: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'class' | 'private';
    showActivityStatus: boolean;
    allowAnalytics: boolean;
    allowPersonalization: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    trustedDevicesOnly: boolean;
    loginAlertEmail: boolean;
  };
  dataManagement: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}
```

---

## 14. ERROR HANDLING STANDARD

- gunakan error map per kategori
- jangan generic “something went wrong” saja
- tampilkan recovery action

Contoh:

- “Gagal memuat sesi aktif. Periksa koneksi lalu coba lagi.”
- tombol: “Muat Ulang”

---

## 15. PERFORMANCE TARGETS

- first render settings < 1.5s (warm)
- TTI < 2.5s (cold)
- no layout shift yang mengganggu
- optimistic update untuk toggle kecil

---

## 16. SECURITY REQUIREMENTS

- CSRF aman untuk seluruh mutasi
- validasi input backend
- audit log untuk perubahan setting sensitif
- rate limit endpoint kritis

---

## 17. QA STRATEGY

### Functional

- update per kategori
- reset
- import/export
- clear cache
- terminate session

### UX

- mobile portrait/landscape
- tablet
- desktop ultrawide

### Theme

- light
- dark
- system

### Edge Cases

- offline mode
- API timeout
- partial response
- unauthorized token expired

---

## 18. RELEASE PLAN

Phase 1:
- visual refactor + no dummy data

Phase 2:
- innovation widgets + timeline

Phase 3:
- presets + recommendation engine

Phase 4:
- analytics + optimization

---

## 19. DO / DON'T

### DO

- gunakan glassmorphism konsisten
- gunakan copy satu tema
- prioritaskan readability
- test di mobile real

### DON'T

- jangan pakai floating icon heboh
- jangan hardcode data runtime
- jangan campur style lama dan baru
- jangan pakai warna navy flat di container utama

---

## 20. IMPLEMENTATION MASTER CHECKLIST

- [ ] Header gradient sesuai admin
- [ ] Header icon tanpa container
- [ ] Floating icon animation dihapus
- [ ] Back button style konsisten
- [ ] Mobile header rapi
- [ ] Sidebar dan content glassmorphism
- [ ] Semua dummy data dihapus
- [ ] Endpoint real terintegrasi
- [ ] Save state jelas
- [ ] Error state jelas
- [ ] Security panel real data
- [ ] Storage breakdown real
- [ ] Preset cepat tersedia
- [ ] Health score tersedia
- [ ] Change timeline tersedia
- [ ] Test dark mode lolos
- [ ] Test mobile lolos
- [ ] Test accessibility basic lolos
- [ ] No TS error
- [ ] No console warning

---

## 21. ADVANCED SECTION: IMPLEMENTATION BLUEPRINT DETAIL

Bagian ini memberikan detail granular per fitur agar tim bisa eksekusi paralel.

### 21.1 Header Refactor Tasks

- update color token
- update icon strategy
- update back button
- update mobile stack
- remove noisy animation

### 21.2 Settings Sidebar Tasks

- search input compact responsive
- grouped categories
- active indicator subtle
- keyboard navigation

### 21.3 General Settings Tasks

- timezone selector lazy load
- locale labels translated
- immediate feedback

### 21.4 Notification Settings Tasks

- quiet hours UI
- dependency warnings
- critical notification lock

### 21.5 Appearance Settings Tasks

- theme switch smooth
- reduce motion toggle
- density preview card

### 21.6 Privacy Settings Tasks

- visibility matrix
- consent summary
- revoke personalization

### 21.7 Security Settings Tasks

- active session cards
- terminate CTA
- 2FA state sync
- suspicious login alert

### 21.8 Data Management Tasks

- storage chart real
- clear cache result
- import/export validation
- backup status badge

### 21.9 Innovation Widgets Tasks

- health score algorithm
- recommendations panel
- quick presets
- timeline feed

### 21.10 Observability Tasks

- analytics event map
- error logs
- performance marks

---

## 22. API CONTRACTS (DETAIL)

### 22.1 GET /api/settings

Response:

```json
{
  "success": true,
  "data": {
    "general": {},
    "notifications": {},
    "appearance": {},
    "privacy": {},
    "security": {},
    "dataManagement": {}
  }
}
```

### 22.2 PATCH /api/settings/{category}

Body:

```json
{
  "updates": {}
}
```

Response:

```json
{
  "success": true,
  "message": "Pengaturan berhasil disimpan",
  "data": {}
}
```

### 22.3 GET /api/settings/storage-usage

Response:

```json
{
  "success": true,
  "data": {
    "used": 0,
    "total": 0,
    "breakdown": {
      "documents": 0,
      "cache": 0,
      "other": 0
    }
  }
}
```

### 22.4 GET /api/settings/security/active-sessions

### 22.5 GET /api/settings/security/login-history

### 22.6 POST /api/settings/security/terminate-session

### 22.7 POST /api/settings/reset

### 22.8 POST /api/settings/export

### 22.9 POST /api/settings/import

### 22.10 POST /api/settings/cache/clear

---

## 23. WRITING MANUAL FOR SETTINGS CONTENT

### 23.1 Structure Template Per Section

1. Judul
2. Subjudul
3. Toggle/Input utama
4. Dampak perubahan
5. Call-to-action

### 23.2 Sentence Style

- aktif
- langsung
- minim jargon

### 23.3 User Education Snippets

Setiap section harus punya 1 snippet edukasi ringkas.

Contoh:

“Menyalakan notifikasi deadline membantu Anda terhindar dari keterlambatan pengumpulan tugas.”

---

## 24. DEFINITION OF DONE

Fitur dianggap selesai jika:

1. visual match admin verified
2. no dummy data
3. mobile QA pass
4. API integration pass
5. accessibility baseline pass
6. no lint errors
7. no critical console errors

---

## 25. LARGE-SCALE IMPLEMENTATION MATRICES

## 26. MATRIX A - 120 DETAILED UI RULES

### UI-RULE-1
- Objective: Pastikan elemen UI ke-1 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-1.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-1.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-1.

### UI-RULE-2
- Objective: Pastikan elemen UI ke-2 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-2.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-2.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-2.

### UI-RULE-3
- Objective: Pastikan elemen UI ke-3 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-3.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-3.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-3.

### UI-RULE-4
- Objective: Pastikan elemen UI ke-4 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-4.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-4.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-4.

### UI-RULE-5
- Objective: Pastikan elemen UI ke-5 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-5.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-5.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-5.

### UI-RULE-6
- Objective: Pastikan elemen UI ke-6 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-6.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-6.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-6.

### UI-RULE-7
- Objective: Pastikan elemen UI ke-7 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-7.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-7.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-7.

### UI-RULE-8
- Objective: Pastikan elemen UI ke-8 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-8.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-8.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-8.

### UI-RULE-9
- Objective: Pastikan elemen UI ke-9 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-9.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-9.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-9.

### UI-RULE-10
- Objective: Pastikan elemen UI ke-10 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-10.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-10.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-10.

### UI-RULE-11
- Objective: Pastikan elemen UI ke-11 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-11.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-11.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-11.

### UI-RULE-12
- Objective: Pastikan elemen UI ke-12 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-12.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-12.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-12.

### UI-RULE-13
- Objective: Pastikan elemen UI ke-13 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-13.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-13.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-13.

### UI-RULE-14
- Objective: Pastikan elemen UI ke-14 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-14.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-14.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-14.

### UI-RULE-15
- Objective: Pastikan elemen UI ke-15 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-15.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-15.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-15.

### UI-RULE-16
- Objective: Pastikan elemen UI ke-16 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-16.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-16.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-16.

### UI-RULE-17
- Objective: Pastikan elemen UI ke-17 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-17.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-17.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-17.

### UI-RULE-18
- Objective: Pastikan elemen UI ke-18 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-18.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-18.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-18.

### UI-RULE-19
- Objective: Pastikan elemen UI ke-19 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-19.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-19.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-19.

### UI-RULE-20
- Objective: Pastikan elemen UI ke-20 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-20.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-20.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-20.

### UI-RULE-21
- Objective: Pastikan elemen UI ke-21 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-21.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-21.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-21.

### UI-RULE-22
- Objective: Pastikan elemen UI ke-22 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-22.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-22.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-22.

### UI-RULE-23
- Objective: Pastikan elemen UI ke-23 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-23.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-23.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-23.

### UI-RULE-24
- Objective: Pastikan elemen UI ke-24 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-24.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-24.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-24.

### UI-RULE-25
- Objective: Pastikan elemen UI ke-25 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-25.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-25.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-25.

### UI-RULE-26
- Objective: Pastikan elemen UI ke-26 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-26.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-26.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-26.

### UI-RULE-27
- Objective: Pastikan elemen UI ke-27 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-27.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-27.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-27.

### UI-RULE-28
- Objective: Pastikan elemen UI ke-28 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-28.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-28.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-28.

### UI-RULE-29
- Objective: Pastikan elemen UI ke-29 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-29.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-29.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-29.

### UI-RULE-30
- Objective: Pastikan elemen UI ke-30 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-30.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-30.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-30.

### UI-RULE-31
- Objective: Pastikan elemen UI ke-31 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-31.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-31.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-31.

### UI-RULE-32
- Objective: Pastikan elemen UI ke-32 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-32.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-32.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-32.

### UI-RULE-33
- Objective: Pastikan elemen UI ke-33 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-33.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-33.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-33.

### UI-RULE-34
- Objective: Pastikan elemen UI ke-34 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-34.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-34.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-34.

### UI-RULE-35
- Objective: Pastikan elemen UI ke-35 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-35.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-35.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-35.

### UI-RULE-36
- Objective: Pastikan elemen UI ke-36 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-36.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-36.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-36.

### UI-RULE-37
- Objective: Pastikan elemen UI ke-37 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-37.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-37.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-37.

### UI-RULE-38
- Objective: Pastikan elemen UI ke-38 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-38.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-38.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-38.

### UI-RULE-39
- Objective: Pastikan elemen UI ke-39 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-39.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-39.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-39.

### UI-RULE-40
- Objective: Pastikan elemen UI ke-40 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-40.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-40.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-40.

### UI-RULE-41
- Objective: Pastikan elemen UI ke-41 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-41.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-41.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-41.

### UI-RULE-42
- Objective: Pastikan elemen UI ke-42 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-42.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-42.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-42.

### UI-RULE-43
- Objective: Pastikan elemen UI ke-43 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-43.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-43.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-43.

### UI-RULE-44
- Objective: Pastikan elemen UI ke-44 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-44.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-44.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-44.

### UI-RULE-45
- Objective: Pastikan elemen UI ke-45 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-45.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-45.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-45.

### UI-RULE-46
- Objective: Pastikan elemen UI ke-46 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-46.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-46.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-46.

### UI-RULE-47
- Objective: Pastikan elemen UI ke-47 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-47.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-47.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-47.

### UI-RULE-48
- Objective: Pastikan elemen UI ke-48 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-48.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-48.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-48.

### UI-RULE-49
- Objective: Pastikan elemen UI ke-49 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-49.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-49.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-49.

### UI-RULE-50
- Objective: Pastikan elemen UI ke-50 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-50.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-50.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-50.

### UI-RULE-51
- Objective: Pastikan elemen UI ke-51 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-51.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-51.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-51.

### UI-RULE-52
- Objective: Pastikan elemen UI ke-52 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-52.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-52.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-52.

### UI-RULE-53
- Objective: Pastikan elemen UI ke-53 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-53.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-53.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-53.

### UI-RULE-54
- Objective: Pastikan elemen UI ke-54 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-54.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-54.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-54.

### UI-RULE-55
- Objective: Pastikan elemen UI ke-55 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-55.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-55.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-55.

### UI-RULE-56
- Objective: Pastikan elemen UI ke-56 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-56.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-56.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-56.

### UI-RULE-57
- Objective: Pastikan elemen UI ke-57 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-57.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-57.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-57.

### UI-RULE-58
- Objective: Pastikan elemen UI ke-58 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-58.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-58.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-58.

### UI-RULE-59
- Objective: Pastikan elemen UI ke-59 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-59.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-59.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-59.

### UI-RULE-60
- Objective: Pastikan elemen UI ke-60 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-60.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-60.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-60.

### UI-RULE-61
- Objective: Pastikan elemen UI ke-61 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-61.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-61.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-61.

### UI-RULE-62
- Objective: Pastikan elemen UI ke-62 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-62.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-62.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-62.

### UI-RULE-63
- Objective: Pastikan elemen UI ke-63 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-63.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-63.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-63.

### UI-RULE-64
- Objective: Pastikan elemen UI ke-64 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-64.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-64.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-64.

### UI-RULE-65
- Objective: Pastikan elemen UI ke-65 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-65.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-65.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-65.

### UI-RULE-66
- Objective: Pastikan elemen UI ke-66 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-66.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-66.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-66.

### UI-RULE-67
- Objective: Pastikan elemen UI ke-67 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-67.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-67.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-67.

### UI-RULE-68
- Objective: Pastikan elemen UI ke-68 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-68.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-68.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-68.

### UI-RULE-69
- Objective: Pastikan elemen UI ke-69 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-69.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-69.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-69.

### UI-RULE-70
- Objective: Pastikan elemen UI ke-70 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-70.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-70.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-70.

### UI-RULE-71
- Objective: Pastikan elemen UI ke-71 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-71.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-71.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-71.

### UI-RULE-72
- Objective: Pastikan elemen UI ke-72 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-72.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-72.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-72.

### UI-RULE-73
- Objective: Pastikan elemen UI ke-73 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-73.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-73.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-73.

### UI-RULE-74
- Objective: Pastikan elemen UI ke-74 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-74.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-74.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-74.

### UI-RULE-75
- Objective: Pastikan elemen UI ke-75 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-75.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-75.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-75.

### UI-RULE-76
- Objective: Pastikan elemen UI ke-76 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-76.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-76.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-76.

### UI-RULE-77
- Objective: Pastikan elemen UI ke-77 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-77.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-77.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-77.

### UI-RULE-78
- Objective: Pastikan elemen UI ke-78 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-78.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-78.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-78.

### UI-RULE-79
- Objective: Pastikan elemen UI ke-79 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-79.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-79.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-79.

### UI-RULE-80
- Objective: Pastikan elemen UI ke-80 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-80.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-80.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-80.

### UI-RULE-81
- Objective: Pastikan elemen UI ke-81 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-81.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-81.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-81.

### UI-RULE-82
- Objective: Pastikan elemen UI ke-82 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-82.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-82.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-82.

### UI-RULE-83
- Objective: Pastikan elemen UI ke-83 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-83.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-83.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-83.

### UI-RULE-84
- Objective: Pastikan elemen UI ke-84 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-84.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-84.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-84.

### UI-RULE-85
- Objective: Pastikan elemen UI ke-85 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-85.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-85.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-85.

### UI-RULE-86
- Objective: Pastikan elemen UI ke-86 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-86.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-86.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-86.

### UI-RULE-87
- Objective: Pastikan elemen UI ke-87 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-87.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-87.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-87.

### UI-RULE-88
- Objective: Pastikan elemen UI ke-88 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-88.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-88.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-88.

### UI-RULE-89
- Objective: Pastikan elemen UI ke-89 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-89.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-89.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-89.

### UI-RULE-90
- Objective: Pastikan elemen UI ke-90 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-90.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-90.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-90.

### UI-RULE-91
- Objective: Pastikan elemen UI ke-91 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-91.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-91.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-91.

### UI-RULE-92
- Objective: Pastikan elemen UI ke-92 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-92.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-92.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-92.

### UI-RULE-93
- Objective: Pastikan elemen UI ke-93 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-93.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-93.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-93.

### UI-RULE-94
- Objective: Pastikan elemen UI ke-94 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-94.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-94.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-94.

### UI-RULE-95
- Objective: Pastikan elemen UI ke-95 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-95.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-95.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-95.

### UI-RULE-96
- Objective: Pastikan elemen UI ke-96 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-96.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-96.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-96.

### UI-RULE-97
- Objective: Pastikan elemen UI ke-97 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-97.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-97.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-97.

### UI-RULE-98
- Objective: Pastikan elemen UI ke-98 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-98.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-98.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-98.

### UI-RULE-99
- Objective: Pastikan elemen UI ke-99 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-99.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-99.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-99.

### UI-RULE-100
- Objective: Pastikan elemen UI ke-100 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-100.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-100.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-100.

### UI-RULE-101
- Objective: Pastikan elemen UI ke-101 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-101.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-101.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-101.

### UI-RULE-102
- Objective: Pastikan elemen UI ke-102 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-102.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-102.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-102.

### UI-RULE-103
- Objective: Pastikan elemen UI ke-103 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-103.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-103.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-103.

### UI-RULE-104
- Objective: Pastikan elemen UI ke-104 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-104.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-104.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-104.

### UI-RULE-105
- Objective: Pastikan elemen UI ke-105 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-105.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-105.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-105.

### UI-RULE-106
- Objective: Pastikan elemen UI ke-106 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-106.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-106.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-106.

### UI-RULE-107
- Objective: Pastikan elemen UI ke-107 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-107.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-107.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-107.

### UI-RULE-108
- Objective: Pastikan elemen UI ke-108 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-108.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-108.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-108.

### UI-RULE-109
- Objective: Pastikan elemen UI ke-109 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-109.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-109.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-109.

### UI-RULE-110
- Objective: Pastikan elemen UI ke-110 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-110.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-110.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-110.

### UI-RULE-111
- Objective: Pastikan elemen UI ke-111 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-111.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-111.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-111.

### UI-RULE-112
- Objective: Pastikan elemen UI ke-112 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-112.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-112.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-112.

### UI-RULE-113
- Objective: Pastikan elemen UI ke-113 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-113.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-113.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-113.

### UI-RULE-114
- Objective: Pastikan elemen UI ke-114 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-114.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-114.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-114.

### UI-RULE-115
- Objective: Pastikan elemen UI ke-115 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-115.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-115.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-115.

### UI-RULE-116
- Objective: Pastikan elemen UI ke-116 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-116.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-116.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-116.

### UI-RULE-117
- Objective: Pastikan elemen UI ke-117 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-117.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-117.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-117.

### UI-RULE-118
- Objective: Pastikan elemen UI ke-118 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-118.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-118.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-118.

### UI-RULE-119
- Objective: Pastikan elemen UI ke-119 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-119.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-119.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-119.

### UI-RULE-120
- Objective: Pastikan elemen UI ke-120 konsisten dengan token dashboard admin.
- Implementation: Terapkan class glassmorphism, spacing, dan typography standar pada area ke-120.
- Validation: Uji light/dark + responsive + hover/focus state untuk area ke-120.
- Anti-Pattern: Hindari warna navy flat, border abu legacy, dan animasi berlebihan pada area ke-120.

## 27. MATRIX B - 100 MOBILE UX RULES

### MOBILE-RULE-1
- Layout: Komponen mobile ke-1 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-1.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-1.

### MOBILE-RULE-2
- Layout: Komponen mobile ke-2 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-2.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-2.

### MOBILE-RULE-3
- Layout: Komponen mobile ke-3 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-3.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-3.

### MOBILE-RULE-4
- Layout: Komponen mobile ke-4 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-4.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-4.

### MOBILE-RULE-5
- Layout: Komponen mobile ke-5 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-5.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-5.

### MOBILE-RULE-6
- Layout: Komponen mobile ke-6 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-6.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-6.

### MOBILE-RULE-7
- Layout: Komponen mobile ke-7 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-7.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-7.

### MOBILE-RULE-8
- Layout: Komponen mobile ke-8 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-8.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-8.

### MOBILE-RULE-9
- Layout: Komponen mobile ke-9 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-9.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-9.

### MOBILE-RULE-10
- Layout: Komponen mobile ke-10 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-10.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-10.

### MOBILE-RULE-11
- Layout: Komponen mobile ke-11 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-11.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-11.

### MOBILE-RULE-12
- Layout: Komponen mobile ke-12 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-12.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-12.

### MOBILE-RULE-13
- Layout: Komponen mobile ke-13 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-13.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-13.

### MOBILE-RULE-14
- Layout: Komponen mobile ke-14 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-14.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-14.

### MOBILE-RULE-15
- Layout: Komponen mobile ke-15 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-15.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-15.

### MOBILE-RULE-16
- Layout: Komponen mobile ke-16 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-16.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-16.

### MOBILE-RULE-17
- Layout: Komponen mobile ke-17 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-17.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-17.

### MOBILE-RULE-18
- Layout: Komponen mobile ke-18 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-18.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-18.

### MOBILE-RULE-19
- Layout: Komponen mobile ke-19 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-19.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-19.

### MOBILE-RULE-20
- Layout: Komponen mobile ke-20 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-20.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-20.

### MOBILE-RULE-21
- Layout: Komponen mobile ke-21 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-21.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-21.

### MOBILE-RULE-22
- Layout: Komponen mobile ke-22 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-22.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-22.

### MOBILE-RULE-23
- Layout: Komponen mobile ke-23 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-23.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-23.

### MOBILE-RULE-24
- Layout: Komponen mobile ke-24 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-24.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-24.

### MOBILE-RULE-25
- Layout: Komponen mobile ke-25 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-25.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-25.

### MOBILE-RULE-26
- Layout: Komponen mobile ke-26 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-26.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-26.

### MOBILE-RULE-27
- Layout: Komponen mobile ke-27 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-27.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-27.

### MOBILE-RULE-28
- Layout: Komponen mobile ke-28 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-28.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-28.

### MOBILE-RULE-29
- Layout: Komponen mobile ke-29 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-29.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-29.

### MOBILE-RULE-30
- Layout: Komponen mobile ke-30 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-30.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-30.

### MOBILE-RULE-31
- Layout: Komponen mobile ke-31 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-31.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-31.

### MOBILE-RULE-32
- Layout: Komponen mobile ke-32 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-32.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-32.

### MOBILE-RULE-33
- Layout: Komponen mobile ke-33 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-33.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-33.

### MOBILE-RULE-34
- Layout: Komponen mobile ke-34 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-34.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-34.

### MOBILE-RULE-35
- Layout: Komponen mobile ke-35 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-35.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-35.

### MOBILE-RULE-36
- Layout: Komponen mobile ke-36 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-36.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-36.

### MOBILE-RULE-37
- Layout: Komponen mobile ke-37 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-37.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-37.

### MOBILE-RULE-38
- Layout: Komponen mobile ke-38 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-38.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-38.

### MOBILE-RULE-39
- Layout: Komponen mobile ke-39 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-39.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-39.

### MOBILE-RULE-40
- Layout: Komponen mobile ke-40 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-40.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-40.

### MOBILE-RULE-41
- Layout: Komponen mobile ke-41 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-41.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-41.

### MOBILE-RULE-42
- Layout: Komponen mobile ke-42 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-42.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-42.

### MOBILE-RULE-43
- Layout: Komponen mobile ke-43 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-43.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-43.

### MOBILE-RULE-44
- Layout: Komponen mobile ke-44 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-44.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-44.

### MOBILE-RULE-45
- Layout: Komponen mobile ke-45 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-45.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-45.

### MOBILE-RULE-46
- Layout: Komponen mobile ke-46 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-46.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-46.

### MOBILE-RULE-47
- Layout: Komponen mobile ke-47 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-47.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-47.

### MOBILE-RULE-48
- Layout: Komponen mobile ke-48 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-48.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-48.

### MOBILE-RULE-49
- Layout: Komponen mobile ke-49 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-49.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-49.

### MOBILE-RULE-50
- Layout: Komponen mobile ke-50 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-50.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-50.

### MOBILE-RULE-51
- Layout: Komponen mobile ke-51 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-51.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-51.

### MOBILE-RULE-52
- Layout: Komponen mobile ke-52 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-52.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-52.

### MOBILE-RULE-53
- Layout: Komponen mobile ke-53 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-53.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-53.

### MOBILE-RULE-54
- Layout: Komponen mobile ke-54 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-54.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-54.

### MOBILE-RULE-55
- Layout: Komponen mobile ke-55 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-55.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-55.

### MOBILE-RULE-56
- Layout: Komponen mobile ke-56 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-56.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-56.

### MOBILE-RULE-57
- Layout: Komponen mobile ke-57 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-57.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-57.

### MOBILE-RULE-58
- Layout: Komponen mobile ke-58 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-58.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-58.

### MOBILE-RULE-59
- Layout: Komponen mobile ke-59 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-59.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-59.

### MOBILE-RULE-60
- Layout: Komponen mobile ke-60 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-60.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-60.

### MOBILE-RULE-61
- Layout: Komponen mobile ke-61 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-61.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-61.

### MOBILE-RULE-62
- Layout: Komponen mobile ke-62 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-62.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-62.

### MOBILE-RULE-63
- Layout: Komponen mobile ke-63 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-63.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-63.

### MOBILE-RULE-64
- Layout: Komponen mobile ke-64 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-64.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-64.

### MOBILE-RULE-65
- Layout: Komponen mobile ke-65 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-65.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-65.

### MOBILE-RULE-66
- Layout: Komponen mobile ke-66 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-66.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-66.

### MOBILE-RULE-67
- Layout: Komponen mobile ke-67 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-67.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-67.

### MOBILE-RULE-68
- Layout: Komponen mobile ke-68 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-68.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-68.

### MOBILE-RULE-69
- Layout: Komponen mobile ke-69 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-69.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-69.

### MOBILE-RULE-70
- Layout: Komponen mobile ke-70 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-70.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-70.

### MOBILE-RULE-71
- Layout: Komponen mobile ke-71 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-71.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-71.

### MOBILE-RULE-72
- Layout: Komponen mobile ke-72 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-72.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-72.

### MOBILE-RULE-73
- Layout: Komponen mobile ke-73 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-73.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-73.

### MOBILE-RULE-74
- Layout: Komponen mobile ke-74 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-74.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-74.

### MOBILE-RULE-75
- Layout: Komponen mobile ke-75 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-75.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-75.

### MOBILE-RULE-76
- Layout: Komponen mobile ke-76 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-76.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-76.

### MOBILE-RULE-77
- Layout: Komponen mobile ke-77 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-77.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-77.

### MOBILE-RULE-78
- Layout: Komponen mobile ke-78 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-78.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-78.

### MOBILE-RULE-79
- Layout: Komponen mobile ke-79 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-79.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-79.

### MOBILE-RULE-80
- Layout: Komponen mobile ke-80 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-80.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-80.

### MOBILE-RULE-81
- Layout: Komponen mobile ke-81 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-81.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-81.

### MOBILE-RULE-82
- Layout: Komponen mobile ke-82 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-82.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-82.

### MOBILE-RULE-83
- Layout: Komponen mobile ke-83 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-83.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-83.

### MOBILE-RULE-84
- Layout: Komponen mobile ke-84 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-84.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-84.

### MOBILE-RULE-85
- Layout: Komponen mobile ke-85 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-85.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-85.

### MOBILE-RULE-86
- Layout: Komponen mobile ke-86 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-86.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-86.

### MOBILE-RULE-87
- Layout: Komponen mobile ke-87 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-87.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-87.

### MOBILE-RULE-88
- Layout: Komponen mobile ke-88 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-88.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-88.

### MOBILE-RULE-89
- Layout: Komponen mobile ke-89 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-89.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-89.

### MOBILE-RULE-90
- Layout: Komponen mobile ke-90 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-90.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-90.

### MOBILE-RULE-91
- Layout: Komponen mobile ke-91 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-91.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-91.

### MOBILE-RULE-92
- Layout: Komponen mobile ke-92 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-92.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-92.

### MOBILE-RULE-93
- Layout: Komponen mobile ke-93 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-93.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-93.

### MOBILE-RULE-94
- Layout: Komponen mobile ke-94 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-94.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-94.

### MOBILE-RULE-95
- Layout: Komponen mobile ke-95 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-95.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-95.

### MOBILE-RULE-96
- Layout: Komponen mobile ke-96 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-96.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-96.

### MOBILE-RULE-97
- Layout: Komponen mobile ke-97 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-97.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-97.

### MOBILE-RULE-98
- Layout: Komponen mobile ke-98 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-98.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-98.

### MOBILE-RULE-99
- Layout: Komponen mobile ke-99 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-99.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-99.

### MOBILE-RULE-100
- Layout: Komponen mobile ke-100 wajib stack rapi tanpa overflow horizontal.
- Interaction: Target sentuh minimal 44px dan feedback visual jelas untuk komponen ke-100.
- Accessibility: Pastikan kontras teks/ikon tetap terbaca pada komponen mobile ke-100.

## 28. MATRIX C - 125 DATA INTEGRITY RULES

### DATA-RULE-1
- Source of Truth: Data settings ke-1 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-1 di backend dan frontend.
- Error Handling: Jika data ke-1 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-1 (jika sensitif) dicatat di audit log.

### DATA-RULE-2
- Source of Truth: Data settings ke-2 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-2 di backend dan frontend.
- Error Handling: Jika data ke-2 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-2 (jika sensitif) dicatat di audit log.

### DATA-RULE-3
- Source of Truth: Data settings ke-3 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-3 di backend dan frontend.
- Error Handling: Jika data ke-3 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-3 (jika sensitif) dicatat di audit log.

### DATA-RULE-4
- Source of Truth: Data settings ke-4 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-4 di backend dan frontend.
- Error Handling: Jika data ke-4 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-4 (jika sensitif) dicatat di audit log.

### DATA-RULE-5
- Source of Truth: Data settings ke-5 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-5 di backend dan frontend.
- Error Handling: Jika data ke-5 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-5 (jika sensitif) dicatat di audit log.

### DATA-RULE-6
- Source of Truth: Data settings ke-6 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-6 di backend dan frontend.
- Error Handling: Jika data ke-6 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-6 (jika sensitif) dicatat di audit log.

### DATA-RULE-7
- Source of Truth: Data settings ke-7 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-7 di backend dan frontend.
- Error Handling: Jika data ke-7 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-7 (jika sensitif) dicatat di audit log.

### DATA-RULE-8
- Source of Truth: Data settings ke-8 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-8 di backend dan frontend.
- Error Handling: Jika data ke-8 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-8 (jika sensitif) dicatat di audit log.

### DATA-RULE-9
- Source of Truth: Data settings ke-9 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-9 di backend dan frontend.
- Error Handling: Jika data ke-9 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-9 (jika sensitif) dicatat di audit log.

### DATA-RULE-10
- Source of Truth: Data settings ke-10 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-10 di backend dan frontend.
- Error Handling: Jika data ke-10 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-10 (jika sensitif) dicatat di audit log.

### DATA-RULE-11
- Source of Truth: Data settings ke-11 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-11 di backend dan frontend.
- Error Handling: Jika data ke-11 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-11 (jika sensitif) dicatat di audit log.

### DATA-RULE-12
- Source of Truth: Data settings ke-12 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-12 di backend dan frontend.
- Error Handling: Jika data ke-12 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-12 (jika sensitif) dicatat di audit log.

### DATA-RULE-13
- Source of Truth: Data settings ke-13 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-13 di backend dan frontend.
- Error Handling: Jika data ke-13 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-13 (jika sensitif) dicatat di audit log.

### DATA-RULE-14
- Source of Truth: Data settings ke-14 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-14 di backend dan frontend.
- Error Handling: Jika data ke-14 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-14 (jika sensitif) dicatat di audit log.

### DATA-RULE-15
- Source of Truth: Data settings ke-15 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-15 di backend dan frontend.
- Error Handling: Jika data ke-15 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-15 (jika sensitif) dicatat di audit log.

### DATA-RULE-16
- Source of Truth: Data settings ke-16 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-16 di backend dan frontend.
- Error Handling: Jika data ke-16 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-16 (jika sensitif) dicatat di audit log.

### DATA-RULE-17
- Source of Truth: Data settings ke-17 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-17 di backend dan frontend.
- Error Handling: Jika data ke-17 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-17 (jika sensitif) dicatat di audit log.

### DATA-RULE-18
- Source of Truth: Data settings ke-18 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-18 di backend dan frontend.
- Error Handling: Jika data ke-18 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-18 (jika sensitif) dicatat di audit log.

### DATA-RULE-19
- Source of Truth: Data settings ke-19 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-19 di backend dan frontend.
- Error Handling: Jika data ke-19 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-19 (jika sensitif) dicatat di audit log.

### DATA-RULE-20
- Source of Truth: Data settings ke-20 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-20 di backend dan frontend.
- Error Handling: Jika data ke-20 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-20 (jika sensitif) dicatat di audit log.

### DATA-RULE-21
- Source of Truth: Data settings ke-21 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-21 di backend dan frontend.
- Error Handling: Jika data ke-21 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-21 (jika sensitif) dicatat di audit log.

### DATA-RULE-22
- Source of Truth: Data settings ke-22 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-22 di backend dan frontend.
- Error Handling: Jika data ke-22 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-22 (jika sensitif) dicatat di audit log.

### DATA-RULE-23
- Source of Truth: Data settings ke-23 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-23 di backend dan frontend.
- Error Handling: Jika data ke-23 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-23 (jika sensitif) dicatat di audit log.

### DATA-RULE-24
- Source of Truth: Data settings ke-24 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-24 di backend dan frontend.
- Error Handling: Jika data ke-24 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-24 (jika sensitif) dicatat di audit log.

### DATA-RULE-25
- Source of Truth: Data settings ke-25 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-25 di backend dan frontend.
- Error Handling: Jika data ke-25 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-25 (jika sensitif) dicatat di audit log.

### DATA-RULE-26
- Source of Truth: Data settings ke-26 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-26 di backend dan frontend.
- Error Handling: Jika data ke-26 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-26 (jika sensitif) dicatat di audit log.

### DATA-RULE-27
- Source of Truth: Data settings ke-27 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-27 di backend dan frontend.
- Error Handling: Jika data ke-27 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-27 (jika sensitif) dicatat di audit log.

### DATA-RULE-28
- Source of Truth: Data settings ke-28 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-28 di backend dan frontend.
- Error Handling: Jika data ke-28 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-28 (jika sensitif) dicatat di audit log.

### DATA-RULE-29
- Source of Truth: Data settings ke-29 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-29 di backend dan frontend.
- Error Handling: Jika data ke-29 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-29 (jika sensitif) dicatat di audit log.

### DATA-RULE-30
- Source of Truth: Data settings ke-30 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-30 di backend dan frontend.
- Error Handling: Jika data ke-30 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-30 (jika sensitif) dicatat di audit log.

### DATA-RULE-31
- Source of Truth: Data settings ke-31 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-31 di backend dan frontend.
- Error Handling: Jika data ke-31 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-31 (jika sensitif) dicatat di audit log.

### DATA-RULE-32
- Source of Truth: Data settings ke-32 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-32 di backend dan frontend.
- Error Handling: Jika data ke-32 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-32 (jika sensitif) dicatat di audit log.

### DATA-RULE-33
- Source of Truth: Data settings ke-33 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-33 di backend dan frontend.
- Error Handling: Jika data ke-33 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-33 (jika sensitif) dicatat di audit log.

### DATA-RULE-34
- Source of Truth: Data settings ke-34 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-34 di backend dan frontend.
- Error Handling: Jika data ke-34 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-34 (jika sensitif) dicatat di audit log.

### DATA-RULE-35
- Source of Truth: Data settings ke-35 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-35 di backend dan frontend.
- Error Handling: Jika data ke-35 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-35 (jika sensitif) dicatat di audit log.

### DATA-RULE-36
- Source of Truth: Data settings ke-36 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-36 di backend dan frontend.
- Error Handling: Jika data ke-36 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-36 (jika sensitif) dicatat di audit log.

### DATA-RULE-37
- Source of Truth: Data settings ke-37 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-37 di backend dan frontend.
- Error Handling: Jika data ke-37 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-37 (jika sensitif) dicatat di audit log.

### DATA-RULE-38
- Source of Truth: Data settings ke-38 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-38 di backend dan frontend.
- Error Handling: Jika data ke-38 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-38 (jika sensitif) dicatat di audit log.

### DATA-RULE-39
- Source of Truth: Data settings ke-39 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-39 di backend dan frontend.
- Error Handling: Jika data ke-39 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-39 (jika sensitif) dicatat di audit log.

### DATA-RULE-40
- Source of Truth: Data settings ke-40 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-40 di backend dan frontend.
- Error Handling: Jika data ke-40 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-40 (jika sensitif) dicatat di audit log.

### DATA-RULE-41
- Source of Truth: Data settings ke-41 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-41 di backend dan frontend.
- Error Handling: Jika data ke-41 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-41 (jika sensitif) dicatat di audit log.

### DATA-RULE-42
- Source of Truth: Data settings ke-42 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-42 di backend dan frontend.
- Error Handling: Jika data ke-42 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-42 (jika sensitif) dicatat di audit log.

### DATA-RULE-43
- Source of Truth: Data settings ke-43 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-43 di backend dan frontend.
- Error Handling: Jika data ke-43 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-43 (jika sensitif) dicatat di audit log.

### DATA-RULE-44
- Source of Truth: Data settings ke-44 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-44 di backend dan frontend.
- Error Handling: Jika data ke-44 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-44 (jika sensitif) dicatat di audit log.

### DATA-RULE-45
- Source of Truth: Data settings ke-45 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-45 di backend dan frontend.
- Error Handling: Jika data ke-45 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-45 (jika sensitif) dicatat di audit log.

### DATA-RULE-46
- Source of Truth: Data settings ke-46 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-46 di backend dan frontend.
- Error Handling: Jika data ke-46 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-46 (jika sensitif) dicatat di audit log.

### DATA-RULE-47
- Source of Truth: Data settings ke-47 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-47 di backend dan frontend.
- Error Handling: Jika data ke-47 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-47 (jika sensitif) dicatat di audit log.

### DATA-RULE-48
- Source of Truth: Data settings ke-48 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-48 di backend dan frontend.
- Error Handling: Jika data ke-48 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-48 (jika sensitif) dicatat di audit log.

### DATA-RULE-49
- Source of Truth: Data settings ke-49 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-49 di backend dan frontend.
- Error Handling: Jika data ke-49 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-49 (jika sensitif) dicatat di audit log.

### DATA-RULE-50
- Source of Truth: Data settings ke-50 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-50 di backend dan frontend.
- Error Handling: Jika data ke-50 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-50 (jika sensitif) dicatat di audit log.

### DATA-RULE-51
- Source of Truth: Data settings ke-51 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-51 di backend dan frontend.
- Error Handling: Jika data ke-51 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-51 (jika sensitif) dicatat di audit log.

### DATA-RULE-52
- Source of Truth: Data settings ke-52 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-52 di backend dan frontend.
- Error Handling: Jika data ke-52 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-52 (jika sensitif) dicatat di audit log.

### DATA-RULE-53
- Source of Truth: Data settings ke-53 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-53 di backend dan frontend.
- Error Handling: Jika data ke-53 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-53 (jika sensitif) dicatat di audit log.

### DATA-RULE-54
- Source of Truth: Data settings ke-54 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-54 di backend dan frontend.
- Error Handling: Jika data ke-54 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-54 (jika sensitif) dicatat di audit log.

### DATA-RULE-55
- Source of Truth: Data settings ke-55 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-55 di backend dan frontend.
- Error Handling: Jika data ke-55 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-55 (jika sensitif) dicatat di audit log.

### DATA-RULE-56
- Source of Truth: Data settings ke-56 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-56 di backend dan frontend.
- Error Handling: Jika data ke-56 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-56 (jika sensitif) dicatat di audit log.

### DATA-RULE-57
- Source of Truth: Data settings ke-57 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-57 di backend dan frontend.
- Error Handling: Jika data ke-57 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-57 (jika sensitif) dicatat di audit log.

### DATA-RULE-58
- Source of Truth: Data settings ke-58 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-58 di backend dan frontend.
- Error Handling: Jika data ke-58 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-58 (jika sensitif) dicatat di audit log.

### DATA-RULE-59
- Source of Truth: Data settings ke-59 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-59 di backend dan frontend.
- Error Handling: Jika data ke-59 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-59 (jika sensitif) dicatat di audit log.

### DATA-RULE-60
- Source of Truth: Data settings ke-60 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-60 di backend dan frontend.
- Error Handling: Jika data ke-60 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-60 (jika sensitif) dicatat di audit log.

### DATA-RULE-61
- Source of Truth: Data settings ke-61 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-61 di backend dan frontend.
- Error Handling: Jika data ke-61 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-61 (jika sensitif) dicatat di audit log.

### DATA-RULE-62
- Source of Truth: Data settings ke-62 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-62 di backend dan frontend.
- Error Handling: Jika data ke-62 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-62 (jika sensitif) dicatat di audit log.

### DATA-RULE-63
- Source of Truth: Data settings ke-63 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-63 di backend dan frontend.
- Error Handling: Jika data ke-63 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-63 (jika sensitif) dicatat di audit log.

### DATA-RULE-64
- Source of Truth: Data settings ke-64 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-64 di backend dan frontend.
- Error Handling: Jika data ke-64 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-64 (jika sensitif) dicatat di audit log.

### DATA-RULE-65
- Source of Truth: Data settings ke-65 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-65 di backend dan frontend.
- Error Handling: Jika data ke-65 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-65 (jika sensitif) dicatat di audit log.

### DATA-RULE-66
- Source of Truth: Data settings ke-66 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-66 di backend dan frontend.
- Error Handling: Jika data ke-66 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-66 (jika sensitif) dicatat di audit log.

### DATA-RULE-67
- Source of Truth: Data settings ke-67 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-67 di backend dan frontend.
- Error Handling: Jika data ke-67 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-67 (jika sensitif) dicatat di audit log.

### DATA-RULE-68
- Source of Truth: Data settings ke-68 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-68 di backend dan frontend.
- Error Handling: Jika data ke-68 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-68 (jika sensitif) dicatat di audit log.

### DATA-RULE-69
- Source of Truth: Data settings ke-69 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-69 di backend dan frontend.
- Error Handling: Jika data ke-69 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-69 (jika sensitif) dicatat di audit log.

### DATA-RULE-70
- Source of Truth: Data settings ke-70 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-70 di backend dan frontend.
- Error Handling: Jika data ke-70 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-70 (jika sensitif) dicatat di audit log.

### DATA-RULE-71
- Source of Truth: Data settings ke-71 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-71 di backend dan frontend.
- Error Handling: Jika data ke-71 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-71 (jika sensitif) dicatat di audit log.

### DATA-RULE-72
- Source of Truth: Data settings ke-72 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-72 di backend dan frontend.
- Error Handling: Jika data ke-72 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-72 (jika sensitif) dicatat di audit log.

### DATA-RULE-73
- Source of Truth: Data settings ke-73 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-73 di backend dan frontend.
- Error Handling: Jika data ke-73 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-73 (jika sensitif) dicatat di audit log.

### DATA-RULE-74
- Source of Truth: Data settings ke-74 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-74 di backend dan frontend.
- Error Handling: Jika data ke-74 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-74 (jika sensitif) dicatat di audit log.

### DATA-RULE-75
- Source of Truth: Data settings ke-75 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-75 di backend dan frontend.
- Error Handling: Jika data ke-75 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-75 (jika sensitif) dicatat di audit log.

### DATA-RULE-76
- Source of Truth: Data settings ke-76 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-76 di backend dan frontend.
- Error Handling: Jika data ke-76 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-76 (jika sensitif) dicatat di audit log.

### DATA-RULE-77
- Source of Truth: Data settings ke-77 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-77 di backend dan frontend.
- Error Handling: Jika data ke-77 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-77 (jika sensitif) dicatat di audit log.

### DATA-RULE-78
- Source of Truth: Data settings ke-78 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-78 di backend dan frontend.
- Error Handling: Jika data ke-78 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-78 (jika sensitif) dicatat di audit log.

### DATA-RULE-79
- Source of Truth: Data settings ke-79 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-79 di backend dan frontend.
- Error Handling: Jika data ke-79 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-79 (jika sensitif) dicatat di audit log.

### DATA-RULE-80
- Source of Truth: Data settings ke-80 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-80 di backend dan frontend.
- Error Handling: Jika data ke-80 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-80 (jika sensitif) dicatat di audit log.

### DATA-RULE-81
- Source of Truth: Data settings ke-81 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-81 di backend dan frontend.
- Error Handling: Jika data ke-81 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-81 (jika sensitif) dicatat di audit log.

### DATA-RULE-82
- Source of Truth: Data settings ke-82 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-82 di backend dan frontend.
- Error Handling: Jika data ke-82 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-82 (jika sensitif) dicatat di audit log.

### DATA-RULE-83
- Source of Truth: Data settings ke-83 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-83 di backend dan frontend.
- Error Handling: Jika data ke-83 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-83 (jika sensitif) dicatat di audit log.

### DATA-RULE-84
- Source of Truth: Data settings ke-84 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-84 di backend dan frontend.
- Error Handling: Jika data ke-84 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-84 (jika sensitif) dicatat di audit log.

### DATA-RULE-85
- Source of Truth: Data settings ke-85 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-85 di backend dan frontend.
- Error Handling: Jika data ke-85 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-85 (jika sensitif) dicatat di audit log.

### DATA-RULE-86
- Source of Truth: Data settings ke-86 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-86 di backend dan frontend.
- Error Handling: Jika data ke-86 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-86 (jika sensitif) dicatat di audit log.

### DATA-RULE-87
- Source of Truth: Data settings ke-87 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-87 di backend dan frontend.
- Error Handling: Jika data ke-87 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-87 (jika sensitif) dicatat di audit log.

### DATA-RULE-88
- Source of Truth: Data settings ke-88 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-88 di backend dan frontend.
- Error Handling: Jika data ke-88 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-88 (jika sensitif) dicatat di audit log.

### DATA-RULE-89
- Source of Truth: Data settings ke-89 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-89 di backend dan frontend.
- Error Handling: Jika data ke-89 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-89 (jika sensitif) dicatat di audit log.

### DATA-RULE-90
- Source of Truth: Data settings ke-90 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-90 di backend dan frontend.
- Error Handling: Jika data ke-90 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-90 (jika sensitif) dicatat di audit log.

### DATA-RULE-91
- Source of Truth: Data settings ke-91 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-91 di backend dan frontend.
- Error Handling: Jika data ke-91 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-91 (jika sensitif) dicatat di audit log.

### DATA-RULE-92
- Source of Truth: Data settings ke-92 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-92 di backend dan frontend.
- Error Handling: Jika data ke-92 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-92 (jika sensitif) dicatat di audit log.

### DATA-RULE-93
- Source of Truth: Data settings ke-93 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-93 di backend dan frontend.
- Error Handling: Jika data ke-93 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-93 (jika sensitif) dicatat di audit log.

### DATA-RULE-94
- Source of Truth: Data settings ke-94 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-94 di backend dan frontend.
- Error Handling: Jika data ke-94 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-94 (jika sensitif) dicatat di audit log.

### DATA-RULE-95
- Source of Truth: Data settings ke-95 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-95 di backend dan frontend.
- Error Handling: Jika data ke-95 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-95 (jika sensitif) dicatat di audit log.

### DATA-RULE-96
- Source of Truth: Data settings ke-96 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-96 di backend dan frontend.
- Error Handling: Jika data ke-96 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-96 (jika sensitif) dicatat di audit log.

### DATA-RULE-97
- Source of Truth: Data settings ke-97 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-97 di backend dan frontend.
- Error Handling: Jika data ke-97 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-97 (jika sensitif) dicatat di audit log.

### DATA-RULE-98
- Source of Truth: Data settings ke-98 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-98 di backend dan frontend.
- Error Handling: Jika data ke-98 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-98 (jika sensitif) dicatat di audit log.

### DATA-RULE-99
- Source of Truth: Data settings ke-99 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-99 di backend dan frontend.
- Error Handling: Jika data ke-99 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-99 (jika sensitif) dicatat di audit log.

### DATA-RULE-100
- Source of Truth: Data settings ke-100 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-100 di backend dan frontend.
- Error Handling: Jika data ke-100 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-100 (jika sensitif) dicatat di audit log.

### DATA-RULE-101
- Source of Truth: Data settings ke-101 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-101 di backend dan frontend.
- Error Handling: Jika data ke-101 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-101 (jika sensitif) dicatat di audit log.

### DATA-RULE-102
- Source of Truth: Data settings ke-102 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-102 di backend dan frontend.
- Error Handling: Jika data ke-102 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-102 (jika sensitif) dicatat di audit log.

### DATA-RULE-103
- Source of Truth: Data settings ke-103 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-103 di backend dan frontend.
- Error Handling: Jika data ke-103 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-103 (jika sensitif) dicatat di audit log.

### DATA-RULE-104
- Source of Truth: Data settings ke-104 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-104 di backend dan frontend.
- Error Handling: Jika data ke-104 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-104 (jika sensitif) dicatat di audit log.

### DATA-RULE-105
- Source of Truth: Data settings ke-105 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-105 di backend dan frontend.
- Error Handling: Jika data ke-105 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-105 (jika sensitif) dicatat di audit log.

### DATA-RULE-106
- Source of Truth: Data settings ke-106 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-106 di backend dan frontend.
- Error Handling: Jika data ke-106 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-106 (jika sensitif) dicatat di audit log.

### DATA-RULE-107
- Source of Truth: Data settings ke-107 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-107 di backend dan frontend.
- Error Handling: Jika data ke-107 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-107 (jika sensitif) dicatat di audit log.

### DATA-RULE-108
- Source of Truth: Data settings ke-108 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-108 di backend dan frontend.
- Error Handling: Jika data ke-108 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-108 (jika sensitif) dicatat di audit log.

### DATA-RULE-109
- Source of Truth: Data settings ke-109 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-109 di backend dan frontend.
- Error Handling: Jika data ke-109 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-109 (jika sensitif) dicatat di audit log.

### DATA-RULE-110
- Source of Truth: Data settings ke-110 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-110 di backend dan frontend.
- Error Handling: Jika data ke-110 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-110 (jika sensitif) dicatat di audit log.

### DATA-RULE-111
- Source of Truth: Data settings ke-111 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-111 di backend dan frontend.
- Error Handling: Jika data ke-111 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-111 (jika sensitif) dicatat di audit log.

### DATA-RULE-112
- Source of Truth: Data settings ke-112 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-112 di backend dan frontend.
- Error Handling: Jika data ke-112 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-112 (jika sensitif) dicatat di audit log.

### DATA-RULE-113
- Source of Truth: Data settings ke-113 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-113 di backend dan frontend.
- Error Handling: Jika data ke-113 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-113 (jika sensitif) dicatat di audit log.

### DATA-RULE-114
- Source of Truth: Data settings ke-114 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-114 di backend dan frontend.
- Error Handling: Jika data ke-114 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-114 (jika sensitif) dicatat di audit log.

### DATA-RULE-115
- Source of Truth: Data settings ke-115 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-115 di backend dan frontend.
- Error Handling: Jika data ke-115 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-115 (jika sensitif) dicatat di audit log.

### DATA-RULE-116
- Source of Truth: Data settings ke-116 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-116 di backend dan frontend.
- Error Handling: Jika data ke-116 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-116 (jika sensitif) dicatat di audit log.

### DATA-RULE-117
- Source of Truth: Data settings ke-117 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-117 di backend dan frontend.
- Error Handling: Jika data ke-117 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-117 (jika sensitif) dicatat di audit log.

### DATA-RULE-118
- Source of Truth: Data settings ke-118 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-118 di backend dan frontend.
- Error Handling: Jika data ke-118 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-118 (jika sensitif) dicatat di audit log.

### DATA-RULE-119
- Source of Truth: Data settings ke-119 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-119 di backend dan frontend.
- Error Handling: Jika data ke-119 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-119 (jika sensitif) dicatat di audit log.

### DATA-RULE-120
- Source of Truth: Data settings ke-120 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-120 di backend dan frontend.
- Error Handling: Jika data ke-120 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-120 (jika sensitif) dicatat di audit log.

### DATA-RULE-121
- Source of Truth: Data settings ke-121 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-121 di backend dan frontend.
- Error Handling: Jika data ke-121 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-121 (jika sensitif) dicatat di audit log.

### DATA-RULE-122
- Source of Truth: Data settings ke-122 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-122 di backend dan frontend.
- Error Handling: Jika data ke-122 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-122 (jika sensitif) dicatat di audit log.

### DATA-RULE-123
- Source of Truth: Data settings ke-123 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-123 di backend dan frontend.
- Error Handling: Jika data ke-123 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-123 (jika sensitif) dicatat di audit log.

### DATA-RULE-124
- Source of Truth: Data settings ke-124 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-124 di backend dan frontend.
- Error Handling: Jika data ke-124 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-124 (jika sensitif) dicatat di audit log.

### DATA-RULE-125
- Source of Truth: Data settings ke-125 wajib berasal dari API/backend persisted state.
- Validation: Lakukan validasi payload request/response untuk field ke-125 di backend dan frontend.
- Error Handling: Jika data ke-125 gagal dimuat, tampilkan retry + empty/error state tanpa angka bohong.
- Auditability: Perubahan data ke-125 (jika sensitif) dicatat di audit log.

## 29. MATRIX D - 90 SECURITY & PRIVACY RULES

### SECURITY-RULE-1
- Policy: Pengaturan sensitif ke-1 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-1.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-1 menurunkan keamanan pengguna.

### SECURITY-RULE-2
- Policy: Pengaturan sensitif ke-2 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-2.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-2 menurunkan keamanan pengguna.

### SECURITY-RULE-3
- Policy: Pengaturan sensitif ke-3 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-3.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-3 menurunkan keamanan pengguna.

### SECURITY-RULE-4
- Policy: Pengaturan sensitif ke-4 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-4.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-4 menurunkan keamanan pengguna.

### SECURITY-RULE-5
- Policy: Pengaturan sensitif ke-5 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-5.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-5 menurunkan keamanan pengguna.

### SECURITY-RULE-6
- Policy: Pengaturan sensitif ke-6 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-6.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-6 menurunkan keamanan pengguna.

### SECURITY-RULE-7
- Policy: Pengaturan sensitif ke-7 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-7.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-7 menurunkan keamanan pengguna.

### SECURITY-RULE-8
- Policy: Pengaturan sensitif ke-8 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-8.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-8 menurunkan keamanan pengguna.

### SECURITY-RULE-9
- Policy: Pengaturan sensitif ke-9 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-9.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-9 menurunkan keamanan pengguna.

### SECURITY-RULE-10
- Policy: Pengaturan sensitif ke-10 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-10.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-10 menurunkan keamanan pengguna.

### SECURITY-RULE-11
- Policy: Pengaturan sensitif ke-11 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-11.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-11 menurunkan keamanan pengguna.

### SECURITY-RULE-12
- Policy: Pengaturan sensitif ke-12 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-12.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-12 menurunkan keamanan pengguna.

### SECURITY-RULE-13
- Policy: Pengaturan sensitif ke-13 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-13.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-13 menurunkan keamanan pengguna.

### SECURITY-RULE-14
- Policy: Pengaturan sensitif ke-14 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-14.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-14 menurunkan keamanan pengguna.

### SECURITY-RULE-15
- Policy: Pengaturan sensitif ke-15 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-15.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-15 menurunkan keamanan pengguna.

### SECURITY-RULE-16
- Policy: Pengaturan sensitif ke-16 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-16.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-16 menurunkan keamanan pengguna.

### SECURITY-RULE-17
- Policy: Pengaturan sensitif ke-17 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-17.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-17 menurunkan keamanan pengguna.

### SECURITY-RULE-18
- Policy: Pengaturan sensitif ke-18 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-18.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-18 menurunkan keamanan pengguna.

### SECURITY-RULE-19
- Policy: Pengaturan sensitif ke-19 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-19.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-19 menurunkan keamanan pengguna.

### SECURITY-RULE-20
- Policy: Pengaturan sensitif ke-20 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-20.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-20 menurunkan keamanan pengguna.

### SECURITY-RULE-21
- Policy: Pengaturan sensitif ke-21 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-21.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-21 menurunkan keamanan pengguna.

### SECURITY-RULE-22
- Policy: Pengaturan sensitif ke-22 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-22.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-22 menurunkan keamanan pengguna.

### SECURITY-RULE-23
- Policy: Pengaturan sensitif ke-23 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-23.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-23 menurunkan keamanan pengguna.

### SECURITY-RULE-24
- Policy: Pengaturan sensitif ke-24 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-24.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-24 menurunkan keamanan pengguna.

### SECURITY-RULE-25
- Policy: Pengaturan sensitif ke-25 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-25.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-25 menurunkan keamanan pengguna.

### SECURITY-RULE-26
- Policy: Pengaturan sensitif ke-26 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-26.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-26 menurunkan keamanan pengguna.

### SECURITY-RULE-27
- Policy: Pengaturan sensitif ke-27 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-27.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-27 menurunkan keamanan pengguna.

### SECURITY-RULE-28
- Policy: Pengaturan sensitif ke-28 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-28.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-28 menurunkan keamanan pengguna.

### SECURITY-RULE-29
- Policy: Pengaturan sensitif ke-29 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-29.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-29 menurunkan keamanan pengguna.

### SECURITY-RULE-30
- Policy: Pengaturan sensitif ke-30 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-30.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-30 menurunkan keamanan pengguna.

### SECURITY-RULE-31
- Policy: Pengaturan sensitif ke-31 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-31.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-31 menurunkan keamanan pengguna.

### SECURITY-RULE-32
- Policy: Pengaturan sensitif ke-32 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-32.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-32 menurunkan keamanan pengguna.

### SECURITY-RULE-33
- Policy: Pengaturan sensitif ke-33 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-33.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-33 menurunkan keamanan pengguna.

### SECURITY-RULE-34
- Policy: Pengaturan sensitif ke-34 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-34.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-34 menurunkan keamanan pengguna.

### SECURITY-RULE-35
- Policy: Pengaturan sensitif ke-35 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-35.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-35 menurunkan keamanan pengguna.

### SECURITY-RULE-36
- Policy: Pengaturan sensitif ke-36 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-36.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-36 menurunkan keamanan pengguna.

### SECURITY-RULE-37
- Policy: Pengaturan sensitif ke-37 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-37.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-37 menurunkan keamanan pengguna.

### SECURITY-RULE-38
- Policy: Pengaturan sensitif ke-38 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-38.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-38 menurunkan keamanan pengguna.

### SECURITY-RULE-39
- Policy: Pengaturan sensitif ke-39 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-39.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-39 menurunkan keamanan pengguna.

### SECURITY-RULE-40
- Policy: Pengaturan sensitif ke-40 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-40.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-40 menurunkan keamanan pengguna.

### SECURITY-RULE-41
- Policy: Pengaturan sensitif ke-41 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-41.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-41 menurunkan keamanan pengguna.

### SECURITY-RULE-42
- Policy: Pengaturan sensitif ke-42 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-42.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-42 menurunkan keamanan pengguna.

### SECURITY-RULE-43
- Policy: Pengaturan sensitif ke-43 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-43.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-43 menurunkan keamanan pengguna.

### SECURITY-RULE-44
- Policy: Pengaturan sensitif ke-44 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-44.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-44 menurunkan keamanan pengguna.

### SECURITY-RULE-45
- Policy: Pengaturan sensitif ke-45 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-45.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-45 menurunkan keamanan pengguna.

### SECURITY-RULE-46
- Policy: Pengaturan sensitif ke-46 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-46.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-46 menurunkan keamanan pengguna.

### SECURITY-RULE-47
- Policy: Pengaturan sensitif ke-47 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-47.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-47 menurunkan keamanan pengguna.

### SECURITY-RULE-48
- Policy: Pengaturan sensitif ke-48 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-48.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-48 menurunkan keamanan pengguna.

### SECURITY-RULE-49
- Policy: Pengaturan sensitif ke-49 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-49.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-49 menurunkan keamanan pengguna.

### SECURITY-RULE-50
- Policy: Pengaturan sensitif ke-50 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-50.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-50 menurunkan keamanan pengguna.

### SECURITY-RULE-51
- Policy: Pengaturan sensitif ke-51 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-51.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-51 menurunkan keamanan pengguna.

### SECURITY-RULE-52
- Policy: Pengaturan sensitif ke-52 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-52.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-52 menurunkan keamanan pengguna.

### SECURITY-RULE-53
- Policy: Pengaturan sensitif ke-53 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-53.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-53 menurunkan keamanan pengguna.

### SECURITY-RULE-54
- Policy: Pengaturan sensitif ke-54 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-54.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-54 menurunkan keamanan pengguna.

### SECURITY-RULE-55
- Policy: Pengaturan sensitif ke-55 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-55.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-55 menurunkan keamanan pengguna.

### SECURITY-RULE-56
- Policy: Pengaturan sensitif ke-56 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-56.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-56 menurunkan keamanan pengguna.

### SECURITY-RULE-57
- Policy: Pengaturan sensitif ke-57 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-57.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-57 menurunkan keamanan pengguna.

### SECURITY-RULE-58
- Policy: Pengaturan sensitif ke-58 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-58.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-58 menurunkan keamanan pengguna.

### SECURITY-RULE-59
- Policy: Pengaturan sensitif ke-59 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-59.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-59 menurunkan keamanan pengguna.

### SECURITY-RULE-60
- Policy: Pengaturan sensitif ke-60 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-60.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-60 menurunkan keamanan pengguna.

### SECURITY-RULE-61
- Policy: Pengaturan sensitif ke-61 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-61.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-61 menurunkan keamanan pengguna.

### SECURITY-RULE-62
- Policy: Pengaturan sensitif ke-62 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-62.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-62 menurunkan keamanan pengguna.

### SECURITY-RULE-63
- Policy: Pengaturan sensitif ke-63 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-63.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-63 menurunkan keamanan pengguna.

### SECURITY-RULE-64
- Policy: Pengaturan sensitif ke-64 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-64.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-64 menurunkan keamanan pengguna.

### SECURITY-RULE-65
- Policy: Pengaturan sensitif ke-65 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-65.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-65 menurunkan keamanan pengguna.

### SECURITY-RULE-66
- Policy: Pengaturan sensitif ke-66 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-66.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-66 menurunkan keamanan pengguna.

### SECURITY-RULE-67
- Policy: Pengaturan sensitif ke-67 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-67.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-67 menurunkan keamanan pengguna.

### SECURITY-RULE-68
- Policy: Pengaturan sensitif ke-68 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-68.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-68 menurunkan keamanan pengguna.

### SECURITY-RULE-69
- Policy: Pengaturan sensitif ke-69 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-69.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-69 menurunkan keamanan pengguna.

### SECURITY-RULE-70
- Policy: Pengaturan sensitif ke-70 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-70.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-70 menurunkan keamanan pengguna.

### SECURITY-RULE-71
- Policy: Pengaturan sensitif ke-71 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-71.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-71 menurunkan keamanan pengguna.

### SECURITY-RULE-72
- Policy: Pengaturan sensitif ke-72 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-72.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-72 menurunkan keamanan pengguna.

### SECURITY-RULE-73
- Policy: Pengaturan sensitif ke-73 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-73.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-73 menurunkan keamanan pengguna.

### SECURITY-RULE-74
- Policy: Pengaturan sensitif ke-74 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-74.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-74 menurunkan keamanan pengguna.

### SECURITY-RULE-75
- Policy: Pengaturan sensitif ke-75 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-75.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-75 menurunkan keamanan pengguna.

### SECURITY-RULE-76
- Policy: Pengaturan sensitif ke-76 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-76.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-76 menurunkan keamanan pengguna.

### SECURITY-RULE-77
- Policy: Pengaturan sensitif ke-77 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-77.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-77 menurunkan keamanan pengguna.

### SECURITY-RULE-78
- Policy: Pengaturan sensitif ke-78 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-78.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-78 menurunkan keamanan pengguna.

### SECURITY-RULE-79
- Policy: Pengaturan sensitif ke-79 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-79.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-79 menurunkan keamanan pengguna.

### SECURITY-RULE-80
- Policy: Pengaturan sensitif ke-80 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-80.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-80 menurunkan keamanan pengguna.

### SECURITY-RULE-81
- Policy: Pengaturan sensitif ke-81 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-81.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-81 menurunkan keamanan pengguna.

### SECURITY-RULE-82
- Policy: Pengaturan sensitif ke-82 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-82.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-82 menurunkan keamanan pengguna.

### SECURITY-RULE-83
- Policy: Pengaturan sensitif ke-83 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-83.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-83 menurunkan keamanan pengguna.

### SECURITY-RULE-84
- Policy: Pengaturan sensitif ke-84 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-84.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-84 menurunkan keamanan pengguna.

### SECURITY-RULE-85
- Policy: Pengaturan sensitif ke-85 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-85.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-85 menurunkan keamanan pengguna.

### SECURITY-RULE-86
- Policy: Pengaturan sensitif ke-86 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-86.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-86 menurunkan keamanan pengguna.

### SECURITY-RULE-87
- Policy: Pengaturan sensitif ke-87 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-87.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-87 menurunkan keamanan pengguna.

### SECURITY-RULE-88
- Policy: Pengaturan sensitif ke-88 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-88.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-88 menurunkan keamanan pengguna.

### SECURITY-RULE-89
- Policy: Pengaturan sensitif ke-89 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-89.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-89 menurunkan keamanan pengguna.

### SECURITY-RULE-90
- Policy: Pengaturan sensitif ke-90 membutuhkan proteksi endpoint + permission check yang ketat.
- UX: Tampilkan warning yang informatif sebelum menyimpan perubahan sensitif ke-90.
- Recovery: Sediakan rollback/restore aman jika perubahan ke-90 menurunkan keamanan pengguna.

## 30. MATRIX E - 75 CONTENT WRITING RULES

### CONTENT-RULE-1
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-1.
- Structure: Pastikan judul/subjudul/call-to-action ke-1 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-1 dan gunakan kata kerja aktif.

### CONTENT-RULE-2
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-2.
- Structure: Pastikan judul/subjudul/call-to-action ke-2 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-2 dan gunakan kata kerja aktif.

### CONTENT-RULE-3
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-3.
- Structure: Pastikan judul/subjudul/call-to-action ke-3 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-3 dan gunakan kata kerja aktif.

### CONTENT-RULE-4
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-4.
- Structure: Pastikan judul/subjudul/call-to-action ke-4 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-4 dan gunakan kata kerja aktif.

### CONTENT-RULE-5
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-5.
- Structure: Pastikan judul/subjudul/call-to-action ke-5 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-5 dan gunakan kata kerja aktif.

### CONTENT-RULE-6
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-6.
- Structure: Pastikan judul/subjudul/call-to-action ke-6 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-6 dan gunakan kata kerja aktif.

### CONTENT-RULE-7
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-7.
- Structure: Pastikan judul/subjudul/call-to-action ke-7 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-7 dan gunakan kata kerja aktif.

### CONTENT-RULE-8
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-8.
- Structure: Pastikan judul/subjudul/call-to-action ke-8 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-8 dan gunakan kata kerja aktif.

### CONTENT-RULE-9
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-9.
- Structure: Pastikan judul/subjudul/call-to-action ke-9 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-9 dan gunakan kata kerja aktif.

### CONTENT-RULE-10
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-10.
- Structure: Pastikan judul/subjudul/call-to-action ke-10 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-10 dan gunakan kata kerja aktif.

### CONTENT-RULE-11
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-11.
- Structure: Pastikan judul/subjudul/call-to-action ke-11 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-11 dan gunakan kata kerja aktif.

### CONTENT-RULE-12
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-12.
- Structure: Pastikan judul/subjudul/call-to-action ke-12 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-12 dan gunakan kata kerja aktif.

### CONTENT-RULE-13
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-13.
- Structure: Pastikan judul/subjudul/call-to-action ke-13 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-13 dan gunakan kata kerja aktif.

### CONTENT-RULE-14
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-14.
- Structure: Pastikan judul/subjudul/call-to-action ke-14 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-14 dan gunakan kata kerja aktif.

### CONTENT-RULE-15
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-15.
- Structure: Pastikan judul/subjudul/call-to-action ke-15 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-15 dan gunakan kata kerja aktif.

### CONTENT-RULE-16
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-16.
- Structure: Pastikan judul/subjudul/call-to-action ke-16 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-16 dan gunakan kata kerja aktif.

### CONTENT-RULE-17
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-17.
- Structure: Pastikan judul/subjudul/call-to-action ke-17 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-17 dan gunakan kata kerja aktif.

### CONTENT-RULE-18
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-18.
- Structure: Pastikan judul/subjudul/call-to-action ke-18 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-18 dan gunakan kata kerja aktif.

### CONTENT-RULE-19
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-19.
- Structure: Pastikan judul/subjudul/call-to-action ke-19 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-19 dan gunakan kata kerja aktif.

### CONTENT-RULE-20
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-20.
- Structure: Pastikan judul/subjudul/call-to-action ke-20 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-20 dan gunakan kata kerja aktif.

### CONTENT-RULE-21
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-21.
- Structure: Pastikan judul/subjudul/call-to-action ke-21 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-21 dan gunakan kata kerja aktif.

### CONTENT-RULE-22
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-22.
- Structure: Pastikan judul/subjudul/call-to-action ke-22 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-22 dan gunakan kata kerja aktif.

### CONTENT-RULE-23
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-23.
- Structure: Pastikan judul/subjudul/call-to-action ke-23 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-23 dan gunakan kata kerja aktif.

### CONTENT-RULE-24
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-24.
- Structure: Pastikan judul/subjudul/call-to-action ke-24 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-24 dan gunakan kata kerja aktif.

### CONTENT-RULE-25
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-25.
- Structure: Pastikan judul/subjudul/call-to-action ke-25 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-25 dan gunakan kata kerja aktif.

### CONTENT-RULE-26
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-26.
- Structure: Pastikan judul/subjudul/call-to-action ke-26 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-26 dan gunakan kata kerja aktif.

### CONTENT-RULE-27
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-27.
- Structure: Pastikan judul/subjudul/call-to-action ke-27 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-27 dan gunakan kata kerja aktif.

### CONTENT-RULE-28
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-28.
- Structure: Pastikan judul/subjudul/call-to-action ke-28 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-28 dan gunakan kata kerja aktif.

### CONTENT-RULE-29
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-29.
- Structure: Pastikan judul/subjudul/call-to-action ke-29 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-29 dan gunakan kata kerja aktif.

### CONTENT-RULE-30
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-30.
- Structure: Pastikan judul/subjudul/call-to-action ke-30 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-30 dan gunakan kata kerja aktif.

### CONTENT-RULE-31
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-31.
- Structure: Pastikan judul/subjudul/call-to-action ke-31 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-31 dan gunakan kata kerja aktif.

### CONTENT-RULE-32
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-32.
- Structure: Pastikan judul/subjudul/call-to-action ke-32 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-32 dan gunakan kata kerja aktif.

### CONTENT-RULE-33
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-33.
- Structure: Pastikan judul/subjudul/call-to-action ke-33 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-33 dan gunakan kata kerja aktif.

### CONTENT-RULE-34
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-34.
- Structure: Pastikan judul/subjudul/call-to-action ke-34 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-34 dan gunakan kata kerja aktif.

### CONTENT-RULE-35
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-35.
- Structure: Pastikan judul/subjudul/call-to-action ke-35 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-35 dan gunakan kata kerja aktif.

### CONTENT-RULE-36
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-36.
- Structure: Pastikan judul/subjudul/call-to-action ke-36 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-36 dan gunakan kata kerja aktif.

### CONTENT-RULE-37
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-37.
- Structure: Pastikan judul/subjudul/call-to-action ke-37 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-37 dan gunakan kata kerja aktif.

### CONTENT-RULE-38
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-38.
- Structure: Pastikan judul/subjudul/call-to-action ke-38 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-38 dan gunakan kata kerja aktif.

### CONTENT-RULE-39
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-39.
- Structure: Pastikan judul/subjudul/call-to-action ke-39 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-39 dan gunakan kata kerja aktif.

### CONTENT-RULE-40
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-40.
- Structure: Pastikan judul/subjudul/call-to-action ke-40 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-40 dan gunakan kata kerja aktif.

### CONTENT-RULE-41
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-41.
- Structure: Pastikan judul/subjudul/call-to-action ke-41 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-41 dan gunakan kata kerja aktif.

### CONTENT-RULE-42
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-42.
- Structure: Pastikan judul/subjudul/call-to-action ke-42 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-42 dan gunakan kata kerja aktif.

### CONTENT-RULE-43
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-43.
- Structure: Pastikan judul/subjudul/call-to-action ke-43 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-43 dan gunakan kata kerja aktif.

### CONTENT-RULE-44
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-44.
- Structure: Pastikan judul/subjudul/call-to-action ke-44 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-44 dan gunakan kata kerja aktif.

### CONTENT-RULE-45
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-45.
- Structure: Pastikan judul/subjudul/call-to-action ke-45 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-45 dan gunakan kata kerja aktif.

### CONTENT-RULE-46
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-46.
- Structure: Pastikan judul/subjudul/call-to-action ke-46 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-46 dan gunakan kata kerja aktif.

### CONTENT-RULE-47
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-47.
- Structure: Pastikan judul/subjudul/call-to-action ke-47 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-47 dan gunakan kata kerja aktif.

### CONTENT-RULE-48
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-48.
- Structure: Pastikan judul/subjudul/call-to-action ke-48 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-48 dan gunakan kata kerja aktif.

### CONTENT-RULE-49
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-49.
- Structure: Pastikan judul/subjudul/call-to-action ke-49 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-49 dan gunakan kata kerja aktif.

### CONTENT-RULE-50
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-50.
- Structure: Pastikan judul/subjudul/call-to-action ke-50 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-50 dan gunakan kata kerja aktif.

### CONTENT-RULE-51
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-51.
- Structure: Pastikan judul/subjudul/call-to-action ke-51 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-51 dan gunakan kata kerja aktif.

### CONTENT-RULE-52
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-52.
- Structure: Pastikan judul/subjudul/call-to-action ke-52 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-52 dan gunakan kata kerja aktif.

### CONTENT-RULE-53
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-53.
- Structure: Pastikan judul/subjudul/call-to-action ke-53 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-53 dan gunakan kata kerja aktif.

### CONTENT-RULE-54
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-54.
- Structure: Pastikan judul/subjudul/call-to-action ke-54 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-54 dan gunakan kata kerja aktif.

### CONTENT-RULE-55
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-55.
- Structure: Pastikan judul/subjudul/call-to-action ke-55 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-55 dan gunakan kata kerja aktif.

### CONTENT-RULE-56
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-56.
- Structure: Pastikan judul/subjudul/call-to-action ke-56 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-56 dan gunakan kata kerja aktif.

### CONTENT-RULE-57
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-57.
- Structure: Pastikan judul/subjudul/call-to-action ke-57 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-57 dan gunakan kata kerja aktif.

### CONTENT-RULE-58
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-58.
- Structure: Pastikan judul/subjudul/call-to-action ke-58 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-58 dan gunakan kata kerja aktif.

### CONTENT-RULE-59
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-59.
- Structure: Pastikan judul/subjudul/call-to-action ke-59 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-59 dan gunakan kata kerja aktif.

### CONTENT-RULE-60
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-60.
- Structure: Pastikan judul/subjudul/call-to-action ke-60 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-60 dan gunakan kata kerja aktif.

### CONTENT-RULE-61
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-61.
- Structure: Pastikan judul/subjudul/call-to-action ke-61 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-61 dan gunakan kata kerja aktif.

### CONTENT-RULE-62
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-62.
- Structure: Pastikan judul/subjudul/call-to-action ke-62 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-62 dan gunakan kata kerja aktif.

### CONTENT-RULE-63
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-63.
- Structure: Pastikan judul/subjudul/call-to-action ke-63 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-63 dan gunakan kata kerja aktif.

### CONTENT-RULE-64
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-64.
- Structure: Pastikan judul/subjudul/call-to-action ke-64 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-64 dan gunakan kata kerja aktif.

### CONTENT-RULE-65
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-65.
- Structure: Pastikan judul/subjudul/call-to-action ke-65 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-65 dan gunakan kata kerja aktif.

### CONTENT-RULE-66
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-66.
- Structure: Pastikan judul/subjudul/call-to-action ke-66 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-66 dan gunakan kata kerja aktif.

### CONTENT-RULE-67
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-67.
- Structure: Pastikan judul/subjudul/call-to-action ke-67 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-67 dan gunakan kata kerja aktif.

### CONTENT-RULE-68
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-68.
- Structure: Pastikan judul/subjudul/call-to-action ke-68 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-68 dan gunakan kata kerja aktif.

### CONTENT-RULE-69
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-69.
- Structure: Pastikan judul/subjudul/call-to-action ke-69 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-69 dan gunakan kata kerja aktif.

### CONTENT-RULE-70
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-70.
- Structure: Pastikan judul/subjudul/call-to-action ke-70 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-70 dan gunakan kata kerja aktif.

### CONTENT-RULE-71
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-71.
- Structure: Pastikan judul/subjudul/call-to-action ke-71 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-71 dan gunakan kata kerja aktif.

### CONTENT-RULE-72
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-72.
- Structure: Pastikan judul/subjudul/call-to-action ke-72 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-72 dan gunakan kata kerja aktif.

### CONTENT-RULE-73
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-73.
- Structure: Pastikan judul/subjudul/call-to-action ke-73 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-73 dan gunakan kata kerja aktif.

### CONTENT-RULE-74
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-74.
- Structure: Pastikan judul/subjudul/call-to-action ke-74 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-74 dan gunakan kata kerja aktif.

### CONTENT-RULE-75
- Tone: Gunakan bahasa Indonesia profesional, singkat, dan konsisten untuk microcopy ke-75.
- Structure: Pastikan judul/subjudul/call-to-action ke-75 mengikuti template penulisan satu tema.
- Clarity: Hindari jargon berlebihan pada kalimat ke-75 dan gunakan kata kerja aktif.

## 31. MATRIX F - 150 QA TEST CASES

### QA-CASE-1
- Scenario: Verifikasi perilaku fitur ke-1 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-1, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-2
- Scenario: Verifikasi perilaku fitur ke-2 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-2, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-3
- Scenario: Verifikasi perilaku fitur ke-3 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-3, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-4
- Scenario: Verifikasi perilaku fitur ke-4 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-4, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-5
- Scenario: Verifikasi perilaku fitur ke-5 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-5, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-6
- Scenario: Verifikasi perilaku fitur ke-6 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-6, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-7
- Scenario: Verifikasi perilaku fitur ke-7 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-7, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-8
- Scenario: Verifikasi perilaku fitur ke-8 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-8, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-9
- Scenario: Verifikasi perilaku fitur ke-9 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-9, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-10
- Scenario: Verifikasi perilaku fitur ke-10 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-10, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-11
- Scenario: Verifikasi perilaku fitur ke-11 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-11, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-12
- Scenario: Verifikasi perilaku fitur ke-12 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-12, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-13
- Scenario: Verifikasi perilaku fitur ke-13 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-13, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-14
- Scenario: Verifikasi perilaku fitur ke-14 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-14, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-15
- Scenario: Verifikasi perilaku fitur ke-15 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-15, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-16
- Scenario: Verifikasi perilaku fitur ke-16 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-16, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-17
- Scenario: Verifikasi perilaku fitur ke-17 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-17, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-18
- Scenario: Verifikasi perilaku fitur ke-18 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-18, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-19
- Scenario: Verifikasi perilaku fitur ke-19 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-19, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-20
- Scenario: Verifikasi perilaku fitur ke-20 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-20, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-21
- Scenario: Verifikasi perilaku fitur ke-21 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-21, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-22
- Scenario: Verifikasi perilaku fitur ke-22 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-22, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-23
- Scenario: Verifikasi perilaku fitur ke-23 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-23, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-24
- Scenario: Verifikasi perilaku fitur ke-24 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-24, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-25
- Scenario: Verifikasi perilaku fitur ke-25 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-25, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-26
- Scenario: Verifikasi perilaku fitur ke-26 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-26, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-27
- Scenario: Verifikasi perilaku fitur ke-27 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-27, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-28
- Scenario: Verifikasi perilaku fitur ke-28 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-28, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-29
- Scenario: Verifikasi perilaku fitur ke-29 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-29, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-30
- Scenario: Verifikasi perilaku fitur ke-30 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-30, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-31
- Scenario: Verifikasi perilaku fitur ke-31 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-31, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-32
- Scenario: Verifikasi perilaku fitur ke-32 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-32, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-33
- Scenario: Verifikasi perilaku fitur ke-33 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-33, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-34
- Scenario: Verifikasi perilaku fitur ke-34 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-34, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-35
- Scenario: Verifikasi perilaku fitur ke-35 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-35, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-36
- Scenario: Verifikasi perilaku fitur ke-36 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-36, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-37
- Scenario: Verifikasi perilaku fitur ke-37 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-37, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-38
- Scenario: Verifikasi perilaku fitur ke-38 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-38, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-39
- Scenario: Verifikasi perilaku fitur ke-39 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-39, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-40
- Scenario: Verifikasi perilaku fitur ke-40 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-40, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-41
- Scenario: Verifikasi perilaku fitur ke-41 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-41, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-42
- Scenario: Verifikasi perilaku fitur ke-42 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-42, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-43
- Scenario: Verifikasi perilaku fitur ke-43 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-43, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-44
- Scenario: Verifikasi perilaku fitur ke-44 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-44, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-45
- Scenario: Verifikasi perilaku fitur ke-45 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-45, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-46
- Scenario: Verifikasi perilaku fitur ke-46 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-46, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-47
- Scenario: Verifikasi perilaku fitur ke-47 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-47, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-48
- Scenario: Verifikasi perilaku fitur ke-48 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-48, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-49
- Scenario: Verifikasi perilaku fitur ke-49 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-49, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-50
- Scenario: Verifikasi perilaku fitur ke-50 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-50, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-51
- Scenario: Verifikasi perilaku fitur ke-51 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-51, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-52
- Scenario: Verifikasi perilaku fitur ke-52 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-52, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-53
- Scenario: Verifikasi perilaku fitur ke-53 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-53, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-54
- Scenario: Verifikasi perilaku fitur ke-54 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-54, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-55
- Scenario: Verifikasi perilaku fitur ke-55 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-55, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-56
- Scenario: Verifikasi perilaku fitur ke-56 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-56, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-57
- Scenario: Verifikasi perilaku fitur ke-57 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-57, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-58
- Scenario: Verifikasi perilaku fitur ke-58 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-58, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-59
- Scenario: Verifikasi perilaku fitur ke-59 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-59, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-60
- Scenario: Verifikasi perilaku fitur ke-60 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-60, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-61
- Scenario: Verifikasi perilaku fitur ke-61 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-61, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-62
- Scenario: Verifikasi perilaku fitur ke-62 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-62, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-63
- Scenario: Verifikasi perilaku fitur ke-63 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-63, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-64
- Scenario: Verifikasi perilaku fitur ke-64 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-64, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-65
- Scenario: Verifikasi perilaku fitur ke-65 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-65, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-66
- Scenario: Verifikasi perilaku fitur ke-66 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-66, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-67
- Scenario: Verifikasi perilaku fitur ke-67 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-67, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-68
- Scenario: Verifikasi perilaku fitur ke-68 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-68, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-69
- Scenario: Verifikasi perilaku fitur ke-69 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-69, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-70
- Scenario: Verifikasi perilaku fitur ke-70 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-70, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-71
- Scenario: Verifikasi perilaku fitur ke-71 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-71, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-72
- Scenario: Verifikasi perilaku fitur ke-72 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-72, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-73
- Scenario: Verifikasi perilaku fitur ke-73 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-73, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-74
- Scenario: Verifikasi perilaku fitur ke-74 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-74, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-75
- Scenario: Verifikasi perilaku fitur ke-75 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-75, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-76
- Scenario: Verifikasi perilaku fitur ke-76 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-76, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-77
- Scenario: Verifikasi perilaku fitur ke-77 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-77, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-78
- Scenario: Verifikasi perilaku fitur ke-78 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-78, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-79
- Scenario: Verifikasi perilaku fitur ke-79 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-79, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-80
- Scenario: Verifikasi perilaku fitur ke-80 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-80, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-81
- Scenario: Verifikasi perilaku fitur ke-81 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-81, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-82
- Scenario: Verifikasi perilaku fitur ke-82 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-82, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-83
- Scenario: Verifikasi perilaku fitur ke-83 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-83, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-84
- Scenario: Verifikasi perilaku fitur ke-84 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-84, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-85
- Scenario: Verifikasi perilaku fitur ke-85 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-85, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-86
- Scenario: Verifikasi perilaku fitur ke-86 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-86, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-87
- Scenario: Verifikasi perilaku fitur ke-87 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-87, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-88
- Scenario: Verifikasi perilaku fitur ke-88 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-88, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-89
- Scenario: Verifikasi perilaku fitur ke-89 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-89, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-90
- Scenario: Verifikasi perilaku fitur ke-90 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-90, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-91
- Scenario: Verifikasi perilaku fitur ke-91 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-91, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-92
- Scenario: Verifikasi perilaku fitur ke-92 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-92, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-93
- Scenario: Verifikasi perilaku fitur ke-93 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-93, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-94
- Scenario: Verifikasi perilaku fitur ke-94 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-94, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-95
- Scenario: Verifikasi perilaku fitur ke-95 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-95, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-96
- Scenario: Verifikasi perilaku fitur ke-96 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-96, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-97
- Scenario: Verifikasi perilaku fitur ke-97 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-97, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-98
- Scenario: Verifikasi perilaku fitur ke-98 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-98, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-99
- Scenario: Verifikasi perilaku fitur ke-99 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-99, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-100
- Scenario: Verifikasi perilaku fitur ke-100 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-100, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-101
- Scenario: Verifikasi perilaku fitur ke-101 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-101, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-102
- Scenario: Verifikasi perilaku fitur ke-102 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-102, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-103
- Scenario: Verifikasi perilaku fitur ke-103 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-103, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-104
- Scenario: Verifikasi perilaku fitur ke-104 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-104, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-105
- Scenario: Verifikasi perilaku fitur ke-105 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-105, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-106
- Scenario: Verifikasi perilaku fitur ke-106 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-106, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-107
- Scenario: Verifikasi perilaku fitur ke-107 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-107, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-108
- Scenario: Verifikasi perilaku fitur ke-108 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-108, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-109
- Scenario: Verifikasi perilaku fitur ke-109 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-109, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-110
- Scenario: Verifikasi perilaku fitur ke-110 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-110, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-111
- Scenario: Verifikasi perilaku fitur ke-111 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-111, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-112
- Scenario: Verifikasi perilaku fitur ke-112 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-112, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-113
- Scenario: Verifikasi perilaku fitur ke-113 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-113, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-114
- Scenario: Verifikasi perilaku fitur ke-114 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-114, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-115
- Scenario: Verifikasi perilaku fitur ke-115 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-115, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-116
- Scenario: Verifikasi perilaku fitur ke-116 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-116, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-117
- Scenario: Verifikasi perilaku fitur ke-117 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-117, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-118
- Scenario: Verifikasi perilaku fitur ke-118 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-118, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-119
- Scenario: Verifikasi perilaku fitur ke-119 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-119, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-120
- Scenario: Verifikasi perilaku fitur ke-120 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-120, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-121
- Scenario: Verifikasi perilaku fitur ke-121 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-121, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-122
- Scenario: Verifikasi perilaku fitur ke-122 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-122, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-123
- Scenario: Verifikasi perilaku fitur ke-123 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-123, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-124
- Scenario: Verifikasi perilaku fitur ke-124 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-124, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-125
- Scenario: Verifikasi perilaku fitur ke-125 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-125, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-126
- Scenario: Verifikasi perilaku fitur ke-126 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-126, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-127
- Scenario: Verifikasi perilaku fitur ke-127 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-127, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-128
- Scenario: Verifikasi perilaku fitur ke-128 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-128, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-129
- Scenario: Verifikasi perilaku fitur ke-129 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-129, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-130
- Scenario: Verifikasi perilaku fitur ke-130 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-130, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-131
- Scenario: Verifikasi perilaku fitur ke-131 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-131, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-132
- Scenario: Verifikasi perilaku fitur ke-132 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-132, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-133
- Scenario: Verifikasi perilaku fitur ke-133 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-133, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-134
- Scenario: Verifikasi perilaku fitur ke-134 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-134, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-135
- Scenario: Verifikasi perilaku fitur ke-135 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-135, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-136
- Scenario: Verifikasi perilaku fitur ke-136 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-136, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-137
- Scenario: Verifikasi perilaku fitur ke-137 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-137, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-138
- Scenario: Verifikasi perilaku fitur ke-138 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-138, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-139
- Scenario: Verifikasi perilaku fitur ke-139 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-139, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-140
- Scenario: Verifikasi perilaku fitur ke-140 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-140, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-141
- Scenario: Verifikasi perilaku fitur ke-141 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-141, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-142
- Scenario: Verifikasi perilaku fitur ke-142 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-142, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-143
- Scenario: Verifikasi perilaku fitur ke-143 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-143, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-144
- Scenario: Verifikasi perilaku fitur ke-144 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-144, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-145
- Scenario: Verifikasi perilaku fitur ke-145 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-145, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-146
- Scenario: Verifikasi perilaku fitur ke-146 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-146, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-147
- Scenario: Verifikasi perilaku fitur ke-147 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-147, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-148
- Scenario: Verifikasi perilaku fitur ke-148 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-148, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-149
- Scenario: Verifikasi perilaku fitur ke-149 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-149, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

### QA-CASE-150
- Scenario: Verifikasi perilaku fitur ke-150 pada mode light/dark dan desktop/mobile.
- Steps: Buka halaman settings, lakukan aksi ke-150, simpan, reload, validasi persistensi.
- Expected: Tidak ada crash, tidak ada data dummy, status simpan jelas, dan UI tetap rapi.

## 32. MATRIX G - 60 RELEASE & OPERATIONS RULES

### OPS-RULE-1
- Deployment: Item ke-1 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-1 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-1 jika KPI kritis menurun.

### OPS-RULE-2
- Deployment: Item ke-2 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-2 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-2 jika KPI kritis menurun.

### OPS-RULE-3
- Deployment: Item ke-3 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-3 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-3 jika KPI kritis menurun.

### OPS-RULE-4
- Deployment: Item ke-4 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-4 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-4 jika KPI kritis menurun.

### OPS-RULE-5
- Deployment: Item ke-5 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-5 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-5 jika KPI kritis menurun.

### OPS-RULE-6
- Deployment: Item ke-6 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-6 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-6 jika KPI kritis menurun.

### OPS-RULE-7
- Deployment: Item ke-7 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-7 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-7 jika KPI kritis menurun.

### OPS-RULE-8
- Deployment: Item ke-8 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-8 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-8 jika KPI kritis menurun.

### OPS-RULE-9
- Deployment: Item ke-9 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-9 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-9 jika KPI kritis menurun.

### OPS-RULE-10
- Deployment: Item ke-10 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-10 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-10 jika KPI kritis menurun.

### OPS-RULE-11
- Deployment: Item ke-11 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-11 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-11 jika KPI kritis menurun.

### OPS-RULE-12
- Deployment: Item ke-12 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-12 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-12 jika KPI kritis menurun.

### OPS-RULE-13
- Deployment: Item ke-13 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-13 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-13 jika KPI kritis menurun.

### OPS-RULE-14
- Deployment: Item ke-14 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-14 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-14 jika KPI kritis menurun.

### OPS-RULE-15
- Deployment: Item ke-15 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-15 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-15 jika KPI kritis menurun.

### OPS-RULE-16
- Deployment: Item ke-16 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-16 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-16 jika KPI kritis menurun.

### OPS-RULE-17
- Deployment: Item ke-17 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-17 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-17 jika KPI kritis menurun.

### OPS-RULE-18
- Deployment: Item ke-18 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-18 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-18 jika KPI kritis menurun.

### OPS-RULE-19
- Deployment: Item ke-19 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-19 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-19 jika KPI kritis menurun.

### OPS-RULE-20
- Deployment: Item ke-20 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-20 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-20 jika KPI kritis menurun.

### OPS-RULE-21
- Deployment: Item ke-21 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-21 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-21 jika KPI kritis menurun.

### OPS-RULE-22
- Deployment: Item ke-22 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-22 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-22 jika KPI kritis menurun.

### OPS-RULE-23
- Deployment: Item ke-23 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-23 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-23 jika KPI kritis menurun.

### OPS-RULE-24
- Deployment: Item ke-24 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-24 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-24 jika KPI kritis menurun.

### OPS-RULE-25
- Deployment: Item ke-25 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-25 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-25 jika KPI kritis menurun.

### OPS-RULE-26
- Deployment: Item ke-26 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-26 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-26 jika KPI kritis menurun.

### OPS-RULE-27
- Deployment: Item ke-27 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-27 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-27 jika KPI kritis menurun.

### OPS-RULE-28
- Deployment: Item ke-28 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-28 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-28 jika KPI kritis menurun.

### OPS-RULE-29
- Deployment: Item ke-29 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-29 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-29 jika KPI kritis menurun.

### OPS-RULE-30
- Deployment: Item ke-30 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-30 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-30 jika KPI kritis menurun.

### OPS-RULE-31
- Deployment: Item ke-31 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-31 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-31 jika KPI kritis menurun.

### OPS-RULE-32
- Deployment: Item ke-32 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-32 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-32 jika KPI kritis menurun.

### OPS-RULE-33
- Deployment: Item ke-33 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-33 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-33 jika KPI kritis menurun.

### OPS-RULE-34
- Deployment: Item ke-34 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-34 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-34 jika KPI kritis menurun.

### OPS-RULE-35
- Deployment: Item ke-35 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-35 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-35 jika KPI kritis menurun.

### OPS-RULE-36
- Deployment: Item ke-36 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-36 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-36 jika KPI kritis menurun.

### OPS-RULE-37
- Deployment: Item ke-37 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-37 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-37 jika KPI kritis menurun.

### OPS-RULE-38
- Deployment: Item ke-38 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-38 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-38 jika KPI kritis menurun.

### OPS-RULE-39
- Deployment: Item ke-39 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-39 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-39 jika KPI kritis menurun.

### OPS-RULE-40
- Deployment: Item ke-40 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-40 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-40 jika KPI kritis menurun.

### OPS-RULE-41
- Deployment: Item ke-41 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-41 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-41 jika KPI kritis menurun.

### OPS-RULE-42
- Deployment: Item ke-42 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-42 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-42 jika KPI kritis menurun.

### OPS-RULE-43
- Deployment: Item ke-43 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-43 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-43 jika KPI kritis menurun.

### OPS-RULE-44
- Deployment: Item ke-44 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-44 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-44 jika KPI kritis menurun.

### OPS-RULE-45
- Deployment: Item ke-45 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-45 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-45 jika KPI kritis menurun.

### OPS-RULE-46
- Deployment: Item ke-46 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-46 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-46 jika KPI kritis menurun.

### OPS-RULE-47
- Deployment: Item ke-47 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-47 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-47 jika KPI kritis menurun.

### OPS-RULE-48
- Deployment: Item ke-48 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-48 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-48 jika KPI kritis menurun.

### OPS-RULE-49
- Deployment: Item ke-49 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-49 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-49 jika KPI kritis menurun.

### OPS-RULE-50
- Deployment: Item ke-50 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-50 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-50 jika KPI kritis menurun.

### OPS-RULE-51
- Deployment: Item ke-51 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-51 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-51 jika KPI kritis menurun.

### OPS-RULE-52
- Deployment: Item ke-52 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-52 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-52 jika KPI kritis menurun.

### OPS-RULE-53
- Deployment: Item ke-53 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-53 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-53 jika KPI kritis menurun.

### OPS-RULE-54
- Deployment: Item ke-54 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-54 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-54 jika KPI kritis menurun.

### OPS-RULE-55
- Deployment: Item ke-55 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-55 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-55 jika KPI kritis menurun.

### OPS-RULE-56
- Deployment: Item ke-56 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-56 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-56 jika KPI kritis menurun.

### OPS-RULE-57
- Deployment: Item ke-57 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-57 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-57 jika KPI kritis menurun.

### OPS-RULE-58
- Deployment: Item ke-58 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-58 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-58 jika KPI kritis menurun.

### OPS-RULE-59
- Deployment: Item ke-59 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-59 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-59 jika KPI kritis menurun.

### OPS-RULE-60
- Deployment: Item ke-60 harus lolos checklist staging sebelum production rollout.
- Monitoring: Aktifkan metric/error tracking untuk item ke-60 setelah release.
- Rollback: Siapkan rencana rollback untuk item ke-60 jika KPI kritis menurun.

## 33. FINAL ACCEPTANCE STATEMENT

Prompt master ini wajib digunakan sebagai acuan implementasi menyeluruh menu Pengaturan Mahasiswa.

Setiap perubahan harus:

1. selaras dengan design system,
2. tervalidasi dengan data real,
3. lolos QA lintas perangkat,
4. menjaga konsistensi bahasa dan pengalaman pengguna.

Jika terdapat konflik antar aturan, prioritas eksekusi:

1. keamanan + integritas data,
2. no dummy data,
3. mobile usability,
4. visual consistency,
5. innovation layer.

Dokumen selesai.
