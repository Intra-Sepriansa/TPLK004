# PROMPT: DOSEN SETTINGS PAGE - ULTRA ADVANCED UI/UX

## CONTEXT
Halaman Pengaturan (Settings) untuk Dosen dengan UI/UX modern menggunakan glassmorphism design, purple-fuchsia-pink gradient header, dan organized settings sections.

## CURRENT STATE
File: `resources/js/pages/dosen/settings.tsx`
- Sudah ada struktur dasar settings
- Perlu update UI/UX agar konsisten dengan menu lain (docs, notifications)

## DESIGN REQUIREMENTS

### 1. HEADER SECTION
**Style**: Purple-Fuchsia-Pink Gradient (sama dengan docs & notifications)
```tsx
- Animated gradient background: from-purple-500 via-fuchsia-500 to-pink-600
- Animated backgroundPosition untuk efek bergerak
- Pulsating rings (3 rings dengan delay berbeda)
- Blur orbs di sudut-sudut
- Icon Settings dengan backdrop-blur
- Title: "Kelola Preferensi Dosen"
- Subtitle: "Sesuaikan pengalaman mengajar Anda"
```

### 2. SETTINGS SECTIONS
**Glassmorphism Cards** dengan kategori:

#### A. PENGATURAN UMUM (General Settings)
- **Bahasa** (Language)
  - Dropdown: Bahasa Indonesia, English
  - Icon: Globe
  
- **Zona Waktu** (Timezone)
  - Dropdown: WIB, WITA, WIT
  - Auto-detect timezone
  - Icon: Clock

- **Format Tanggal** (Date Format)
  - Dropdown: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  - Icon: Calendar

#### B. PENGAJARAN (Teaching Preferences)
- **Metode Pengajaran Default**
  - Radio buttons: Tatap Muka, Online, Hybrid
  - Icon: BookOpen

- **Durasi Sesi Default**
  - Input number: 60, 90, 120 menit
  - Icon: Clock

- **Auto-generate QR Code**
  - Toggle switch
  - Description: "Otomatis buat QR code saat sesi dimulai"
  - Icon: QrCode

#### C. NOTIFIKASI (Notifications)
- **Email Notifications**
  - Toggle: Kehadiran mahasiswa
  - Toggle: Tugas baru dikumpulkan
  - Toggle: Pesan dari mahasiswa
  - Icon: Mail

- **Push Notifications**
  - Toggle: Reminder sesi mengajar
  - Toggle: Update sistem
  - Icon: Bell

- **Notification Sound**
  - Toggle switch
  - Icon: Volume2

#### D. TAMPILAN (Display)
- **Theme**
  - Radio buttons: Light, Dark, Auto
  - Icon: Sun/Moon

- **Sidebar Position**
  - Radio buttons: Left, Right
  - Icon: Layout

- **Compact Mode**
  - Toggle switch
  - Description: "Tampilan lebih ringkas"
  - Icon: Minimize2

#### E. PRIVASI (Privacy)
- **Profil Visibility**
  - Dropdown: Public, Private, Students Only
  - Icon: Eye

- **Show Email**
  - Toggle switch
  - Icon: Mail

- **Show Phone**
  - Toggle switch
  - Icon: Phone

#### F. MANAJEMEN DATA (Data Management)
- **Export Data**
  - Button: "Export Semua Data"
  - Format: JSON, CSV, PDF
  - Icon: Download

- **Import Data**
  - Button: "Import Data"
  - Icon: Upload

- **Clear Cache**
  - Button: "Hapus Cache"
  - Icon: Trash2

### 3. CARD DESIGN
**Glassmorphism Style** (sama dengan docs & notifications):
```tsx
className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
```

**Section Header**:
```tsx
- Icon dengan gradient background
- Title dengan font-bold
- Subtitle dengan text-gray-600 dark:text-gray-400
```

**Setting Item**:
```tsx
- Label di kiri
- Control (toggle/dropdown/input) di kanan
- Description text kecil di bawah label (optional)
- Hover effect dengan border-emerald-500/30
```

### 4. SAVE BUTTON
**Sticky Bottom Button**:
```tsx
- Fixed di bottom dengan backdrop-blur
- Gradient: from-emerald-500 to-teal-500
- Shadow dengan emerald glow
- Icon: Save
- Text: "Simpan Perubahan"
- Show only when changes detected
```

### 5. ANIMATIONS
**Framer Motion**:
```tsx
- Stagger animation untuk cards
- Hover scale untuk buttons
- Smooth toggle transitions
- Success toast dengan confetti (optional)
```

### 6. RESPONSIVE DESIGN
```tsx
- Mobile: 1 column, full width cards
- Tablet: 2 columns untuk some sections
- Desktop: 2-3 columns grid
- Sticky header on scroll
```

## COLOR SCHEME
**Consistent dengan Docs & Notifications**:
- Header: `from-purple-500 via-fuchsia-500 to-pink-600`
- Cards: `bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl`
- Borders: `border-white/20 dark:border-white/5`
- Primary Action: `from-emerald-500 to-teal-500`
- Text: `text-gray-900 dark:text-white` (labels), `text-gray-600 dark:text-gray-400` (descriptions)

## ICONS (Lucide React)
```tsx
import {
  Settings, Globe, Clock, Calendar, BookOpen, QrCode,
  Mail, Bell, Volume2, Sun, Moon, Layout, Minimize2,
  Eye, Phone, Download, Upload, Trash2, Save, Check
} from 'lucide-react';
```

## FUNCTIONALITY

### State Management
```tsx
const [settings, setSettings] = useState({
  language: 'id',
  timezone: 'WIB',
  dateFormat: 'DD/MM/YYYY',
  teachingMethod: 'hybrid',
  sessionDuration: 90,
  autoQR: true,
  emailNotif: { attendance: true, tasks: true, messages: true },
  pushNotif: { reminder: true, updates: false },
  notifSound: true,
  theme: 'auto',
  sidebarPosition: 'left',
  compactMode: false,
  profileVisibility: 'students',
  showEmail: false,
  showPhone: false,
});

const [hasChanges, setHasChanges] = useState(false);
const [isSaving, setIsSaving] = useState(false);
```

### Save Handler
```tsx
const handleSave = async () => {
  setIsSaving(true);
  try {
    await fetch('/api/dosen/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    toast.success('Pengaturan berhasil disimpan!');
    setHasChanges(false);
  } catch (error) {
    toast.error('Gagal menyimpan pengaturan');
  } finally {
    setIsSaving(false);
  }
};
```

### Change Detection
```tsx
useEffect(() => {
  // Compare current settings with initial settings
  const changed = JSON.stringify(settings) !== JSON.stringify(initialSettings);
  setHasChanges(changed);
}, [settings]);
```

## COMPONENTS TO USE
1. **Toggle Switch**: Custom component dengan smooth animation
2. **Dropdown**: Select dengan search (untuk timezone, language)
3. **Radio Group**: Untuk theme, teaching method
4. **Input Number**: Untuk session duration
5. **Button**: Primary (save), Secondary (cancel), Danger (clear cache)

## VALIDATION
```tsx
- Session duration: min 30, max 180 menit
- Required fields: language, timezone, dateFormat
- Show error toast jika validation gagal
```

## SUCCESS STATES
```tsx
- Toast notification: "Pengaturan berhasil disimpan!"
- Brief confetti animation (optional)
- Reset hasChanges state
- Update UI immediately
```

## EMPTY/ERROR STATES
```tsx
- Loading skeleton saat fetch initial settings
- Error message jika gagal load
- Retry button
```

## ACCESSIBILITY
```tsx
- Proper labels untuk semua inputs
- Keyboard navigation support
- Focus states yang jelas
- ARIA labels untuk toggles
- Screen reader friendly
```

## PERFORMANCE
```tsx
- Debounce untuk auto-save (optional)
- Lazy load sections
- Memoize expensive computations
- Optimize re-renders
```

## EXAMPLE STRUCTURE
```tsx
<DosenLayout>
  <Head title="Pengaturan" />
  
  <div className="space-y-6 p-6">
    {/* Header - Purple Gradient */}
    <HeaderSection />
    
    {/* Settings Grid */}
    <motion.div variants={staggerContainer} className="grid gap-6 lg:grid-cols-2">
      {/* General Settings Card */}
      <SettingsCard title="Pengaturan Umum" icon={Settings}>
        <LanguageSetting />
        <TimezoneSetting />
        <DateFormatSetting />
      </SettingsCard>
      
      {/* Teaching Preferences Card */}
      <SettingsCard title="Pengajaran" icon={BookOpen}>
        <TeachingMethodSetting />
        <SessionDurationSetting />
        <AutoQRSetting />
      </SettingsCard>
      
      {/* Notifications Card */}
      <SettingsCard title="Notifikasi" icon={Bell}>
        <EmailNotificationSettings />
        <PushNotificationSettings />
        <NotificationSoundSetting />
      </SettingsCard>
      
      {/* Display Card */}
      <SettingsCard title="Tampilan" icon={Layout}>
        <ThemeSetting />
        <SidebarPositionSetting />
        <CompactModeSetting />
      </SettingsCard>
      
      {/* Privacy Card */}
      <SettingsCard title="Privasi" icon={Eye}>
        <ProfileVisibilitySetting />
        <ShowEmailSetting />
        <ShowPhoneSetting />
      </SettingsCard>
      
      {/* Data Management Card */}
      <SettingsCard title="Manajemen Data" icon={Database}>
        <ExportDataButton />
        <ImportDataButton />
        <ClearCacheButton />
      </SettingsCard>
    </motion.div>
    
    {/* Sticky Save Button */}
    {hasChanges && (
      <SaveButton onClick={handleSave} loading={isSaving} />
    )}
  </div>
</DosenLayout>
```

## NOTES
- NO emoji, gunakan icon dari lucide-react
- Consistent glassmorphism design
- Purple-fuchsia-pink gradient header
- Smooth animations dengan framer-motion
- Toast notifications untuk feedback
- Auto-save optional (bisa pakai manual save button)
- Responsive design untuk mobile/tablet/desktop

## REFERENCE FILES
- `resources/js/pages/dosen/docs.tsx` - untuk header style
- `resources/js/pages/dosen/notifications.tsx` - untuk card style
- `resources/js/pages/dosen/profile.tsx` - untuk form inputs
