# PROMPT: ADMIN CREATE SESI ABSEN - ULTRA ADVANCED

## TUJUAN
Membuat halaman Create Sesi Absen untuk Admin yang SANGAT SANGAT ADVANCE dengan UI/UX mengadopsi FULL warna, gradient, dan style dari menu Uang Kas Admin. Halaman ini akan diakses dari menu Sesi Absen dengan button "Buat Sesi Baru" dan mengarahkan ke halaman dedicated untuk membuat sesi absen dengan fitur-fitur lengkap.

---

## UI/UX REFERENCE - WAJIB IKUTI 100%

### Warna & Gradient (EXACT dari Kas Admin)
```tsx
// Background Header
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500

// Animated Background Position
animate={{
  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
}}
transition={{
  duration: 15,
  repeat: Infinity,
  ease: "linear"
}}
style={{
  backgroundSize: '200% 200%',
}}

// Container Cards
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl

// Form Sections dengan Glow Effect
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl
```

### Animation Variants (EXACT dari Kas Admin)
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
} as const;
```

---

## STRUKTUR HALAMAN

### 1. HEADER SECTION
- Background: `bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500`
- Animated background position (15s infinite)
- 3 Pulse rings dengan delay
- Icon: `CalendarPlus` dengan backdrop-blur
- Title: "Buat Sesi Absen Baru"
- Subtitle: "Atur jadwal, lokasi, dan pengaturan absensi dengan mudah"
- Breadcrumb: Admin > Sesi Absen > Buat Baru
- Back button (kembali ke list sesi absen)

### 2. PROGRESS STEPPER (7 Steps)
```tsx
<div className="flex items-center justify-between mb-8">
  {steps.map((step, index) => (
    <div key={index} className="flex items-center">
      <motion.div
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center",
          currentStep === index + 1
            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
            : currentStep > index + 1
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-500"
        )}
        whileHover={{ scale: 1.1 }}
      >
        {currentStep > index + 1 ? (
          <CheckCircle className="h-6 w-6" />
        ) : (
          <span>{index + 1}</span>
        )}
      </motion.div>
      <div className="ml-3">
        <p className="text-sm font-medium">{step.title}</p>
        <p className="text-xs text-gray-500">{step.description}</p>
      </div>
      {index < steps.length - 1 && (
        <div className="h-0.5 w-16 bg-gray-200 mx-4" />
      )}
    </div>
  ))}
</div>
```

**7 Steps:**
1. Informasi Dasar
2. Jadwal & Waktu
3. Lokasi & Zona
4. Metode Absensi
5. Pengaturan Lanjutan
6. Notifikasi
7. Review & Publish

---

## STEP 1: INFORMASI DASAR

### Form Fields:


**1. Nama Sesi** (Required)
- Input text dengan icon `FileText`
- Placeholder: "Contoh: Perkuliahan Algoritma - Pertemuan 1"
- Character counter (max 100)
- Real-time validation

**2. Mata Kuliah** (Required)
- Searchable dropdown dengan icon `BookOpen`
- Auto-complete dari database
- Show: Kode MK, Nama MK, SKS
- Create new option jika tidak ada

**3. Dosen Pengampu** (Required)
- Multi-select dropdown dengan icon `Users`
- Search by name atau NIP
- Show avatar, name, department
- Primary dosen indicator

**4. Kelas/Kelompok** (Required)
- Dropdown dengan icon `Users`
- Options: A, B, C, D, E, Gabungan
- Custom input option

**5. Semester** (Required)
- Dropdown dengan icon `Calendar`
- Options: Ganjil, Genap
- Auto-detect current semester

**6. Tahun Akademik** (Required)
- Dropdown dengan icon `Calendar`
- Format: 2025/2026
- Auto-detect current year

**7. Deskripsi Sesi** (Optional)
- Rich text editor dengan icon `AlignLeft`
- Formatting tools (bold, italic, list, link)
- Character counter (max 500)
- Preview mode

**8. Tags** (Optional)
- Tag input dengan icon `Tag`
- Predefined tags: Teori, Praktikum, Ujian, Quiz, Presentasi
- Custom tags allowed
- Color-coded tags

---

## STEP 2: JADWAL & WAKTU

### Form Fields:

**1. Tanggal Sesi** (Required)
- Date picker dengan icon `Calendar`
- Disable past dates
- Show day of week
- Holiday indicator
- Conflict checker (bentrok dengan sesi lain)

**2. Waktu Mulai** (Required)
- Time picker dengan icon `Clock`
- Format: HH:MM
- Quick select: 07:00, 08:00, 09:00, dst
- Validation: tidak boleh di masa lalu

**3. Waktu Selesai** (Required)
- Time picker dengan icon `Clock`
- Auto-calculate duration
- Validation: harus setelah waktu mulai
- Warning jika durasi > 4 jam

**4. Durasi Sesi** (Auto-calculated)
- Display only
- Format: X jam Y menit
- Color indicator (green: normal, yellow: long, red: very long)

**5. Waktu Buka Absen** (Required)
- Time picker dengan icon `Unlock`
- Default: 15 menit sebelum mulai
- Relative time selector: 5, 10, 15, 30 menit sebelum
- Custom time option

**6. Waktu Tutup Absen** (Required)
- Time picker dengan icon `Lock`
- Default: 15 menit setelah mulai
- Relative time selector: 5, 10, 15, 30 menit setelah
- Custom time option
- Warning jika terlalu singkat

**7. Toleransi Keterlambatan** (Optional)
- Number input dengan icon `Timer`
- Unit: menit
- Default: 15 menit
- Slider untuk quick select (0-60 menit)
- Status indicator: Tepat Waktu, Terlambat, Tidak Hadir

**8. Recurring Schedule** (Optional)
- Toggle switch dengan icon `Repeat`
- Options: Tidak, Mingguan, Bi-weekly, Custom
- End date selector
- Preview generated sessions
- Bulk edit option

---

## STEP 3: LOKASI & ZONA

### Form Fields:

**1. Tipe Lokasi** (Required)
- Radio buttons dengan icons
- Options:
  - `MapPin` Lokasi Fisik (Ruangan)
  - `Globe` Online (Virtual)
  - `Blend` Hybrid (Fisik + Online)

**2. Ruangan/Lokasi** (Required jika Fisik/Hybrid)
- Searchable dropdown dengan icon `Building`
- Show: Gedung, Lantai, Nomor Ruangan, Kapasitas
- Map preview (optional)
- Availability checker
- Add new location option

**3. Gedung** (Auto-filled)
- Display only
- Show building name dan address

**4. Kapasitas Ruangan** (Display only)
- Show max capacity
- Warning jika jumlah mahasiswa > kapasitas

**5. Link Meeting Online** (Required jika Online/Hybrid)
- Input URL dengan icon `Video`
- Validation: valid URL
- Quick select: Zoom, Google Meet, Teams
- Auto-generate meeting link option
- Copy button

**6. Meeting ID & Password** (Optional)
- Input text dengan icon `Key`
- Show/Hide password toggle
- Copy buttons

**7. Zona Absensi** (Required jika Fisik)
- Map selector dengan icon `Map`
- Drag & drop pin untuk set center point
- Radius slider (10m - 500m)
- Visual circle overlay pada map
- Current location button
- Address search
- Save as template option

**8. Koordinat GPS** (Auto-filled)
- Display latitude & longitude
- Copy button
- Verify location button

**9. Geofencing Settings** (Advanced)
- Toggle strict mode
- Allow GPS spoofing detection
- Require WiFi verification
- Bluetooth beacon option

---

## STEP 4: METODE ABSENSI

### Form Fields:

**1. Metode Absensi** (Required, Multiple Select)
- Checkbox group dengan icons dan descriptions
- Options:
  - `QrCode` QR Code Scan
  - `MapPin` GPS/Location Based
  - `Camera` Selfie Verification
  - `Fingerprint` Biometric (jika tersedia)
  - `Smartphone` Manual Check-in
  - `Wifi` WiFi Detection

**2. QR Code Settings** (Jika QR Code dipilih)
- Auto-generate QR code
- QR refresh interval (30s, 1m, 2m, 5m, Static)
- QR code size selector
- Download QR code button
- Print QR code button
- Display QR on screen option

**3. GPS Settings** (Jika GPS dipilih)
- Accuracy level (High, Medium, Low)
- Allow mock location: Yes/No
- Fallback method jika GPS gagal

**4. Selfie Settings** (Jika Selfie dipilih)
- Require face detection: Yes/No
- Face matching threshold (0-100%)
- Allow multiple attempts
- Save selfie for verification
- AI verification toggle

**5. Manual Check-in Settings** (Jika Manual dipilih)
- Require admin approval
- Auto-approve after X minutes
- Notification to admin

**6. Kombinasi Metode** (Advanced)
- Require all methods: Yes/No
- Require at least X methods
- Priority order

---

## STEP 5: PENGATURAN LANJUTAN

### Form Fields:

**1. Status Sesi** (Required)
- Radio buttons dengan icons
- Options:
  - `Eye` Published (Visible to students)
  - `EyeOff` Draft (Not visible)
  - `Clock` Scheduled (Auto-publish at time)

**2. Visibilitas** (Required)
- Radio buttons
- Options:
  - Semua Mahasiswa Kelas
  - Mahasiswa Terpilih (Multi-select)
  - Grup Tertentu

**3. Mahasiswa Terpilih** (Jika Mahasiswa Terpilih)
- Multi-select dengan search
- Show: NIM, Nama, Foto
- Select all/Deselect all
- Import from CSV
- Save as group

**4. Pengaturan Absensi**
- Toggle: Allow late attendance
- Toggle: Allow excuse/permit
- Toggle: Require reason for absence
- Toggle: Send reminder notifications
- Toggle: Auto-close after time limit

**5. Penilaian Kehadiran**
- Number input: Bobot kehadiran (%)
- Calculation method:
  - Simple (Hadir/Tidak Hadir)
  - Weighted (Tepat Waktu: 100%, Terlambat: 75%, Tidak Hadir: 0%)
  - Custom scoring

**6. Sanksi Ketidakhadiran**
- Toggle: Enable sanctions
- Threshold: X kali tidak hadir
- Actions:
  - Warning notification
  - Email to student
  - Email to parent
  - Block next session
  - Report to academic advisor

**7. Kompensasi Kehadiran**
- Toggle: Allow compensation
- Methods:
  - Tugas pengganti
  - Konsultasi dosen
  - Mengikuti kelas lain
- Deadline: X hari setelah sesi

**8. Integrasi Sistem**
- Toggle: Sync to academic system
- Toggle: Export to LMS
- Toggle: Send to parent portal
- API webhook URL (optional)

---

## STEP 6: NOTIFIKASI

### Form Fields:

**1. Notifikasi ke Mahasiswa**
- Toggle: Enable student notifications
- Channels (Multiple select):
  - `Bell` In-app notification
  - `Mail` Email
  - `MessageSquare` WhatsApp
  - `Smartphone` Push notification
  - `MessageCircle` SMS

**2. Timing Notifikasi**
- Checkbox group:
  - 1 hari sebelum sesi
  - 1 jam sebelum sesi
  - 30 menit sebelum sesi
  - Saat sesi dimulai
  - 15 menit sebelum tutup absen
  - Setelah sesi selesai (reminder untuk yang belum absen)

**3. Template Notifikasi**
- Dropdown: Select template
- Preview template
- Edit template (rich text)
- Variables: {nama}, {mata_kuliah}, {waktu}, {lokasi}, {link}
- Save as new template

**4. Notifikasi ke Dosen**
- Toggle: Enable dosen notifications
- Events:
  - Sesi akan dimulai
  - Mahasiswa absen
  - Mahasiswa terlambat
  - Anomali terdeteksi
  - Sesi selesai (summary)

**5. Notifikasi ke Admin**
- Toggle: Enable admin notifications
- Events:
  - Sesi dibuat
  - Sesi diubah
  - Sesi dibatalkan
  - Error/Issue detected

**6. Notifikasi ke Orang Tua** (Optional)
- Toggle: Enable parent notifications
- Events:
  - Anak tidak hadir
  - Anak terlambat X kali
  - Anak mencapai threshold sanksi
- Frequency: Real-time, Daily digest, Weekly digest

**7. Reminder Settings**
- Auto-reminder untuk yang belum absen
- Reminder interval: 5, 10, 15 menit
- Max reminder count: 1-5 kali
- Stop reminder after: X menit

---

## STEP 7: REVIEW & PUBLISH

### Summary Display:

**1. Informasi Sesi**
- Card dengan semua info dari Step 1
- Edit button untuk kembali ke step

**2. Jadwal & Waktu**
- Card dengan timeline visualization
- Show: Tanggal, Waktu, Durasi, Toleransi
- Edit button

**3. Lokasi**
- Card dengan map preview
- Show: Ruangan, Zona, Koordinat
- Edit button

**4. Metode Absensi**
- Card dengan selected methods
- Show icons dan descriptions
- Edit button

**5. Pengaturan**
- Card dengan advanced settings summary
- Show: Status, Visibilitas, Penilaian, Sanksi
- Edit button

**6. Notifikasi**
- Card dengan notification settings
- Show: Channels, Timing, Recipients
- Edit button

**7. Preview QR Code** (Jika QR dipilih)
- Large QR code display
- Download button
- Print button
- Share button

**8. Validation Checklist**
```tsx
<div className="rounded-2xl border p-6">
  <h3 className="flex items-center gap-2">
    <CheckCircle className="h-5 w-5 text-green-500" />
    Validation Checklist
  </h3>
  <div className="space-y-2 mt-4">
    {validations.map(item => (
      <div className="flex items-center gap-2">
        {item.valid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        <span>{item.message}</span>
      </div>
    ))}
  </div>
</div>
```

**9. Action Buttons**
```tsx
<div className="flex items-center justify-between mt-8">
  <Button variant="outline" onClick={handleBack}>
    <ChevronLeft className="h-4 w-4 mr-2" />
    Kembali
  </Button>
  
  <div className="flex gap-3">
    <Button variant="outline" onClick={handleSaveDraft}>
      <Save className="h-4 w-4 mr-2" />
      Simpan Draft
    </Button>
    
    <Button onClick={handlePublish}>
      <Send className="h-4 w-4 mr-2" />
      Publish Sesi
    </Button>
  </div>
</div>
```

---

## FITUR TAMBAHAN ULTRA ADVANCED

### 1. Template Sesi
- Save current settings as template
- Load from template
- Template library
- Share template with other admins
- Template categories

### 2. Bulk Create
- Create multiple sessions at once
- Import from CSV/Excel
- Recurring schedule generator
- Batch edit
- Preview before create

### 3. Conflict Detection
- Check schedule conflicts
- Check room availability
- Check dosen availability
- Check student schedule conflicts
- Suggest alternative times

### 4. Smart Suggestions
- AI-powered location suggestions
- Optimal time slot recommendations
- Attendance pattern analysis
- Historical data insights

### 5. Quick Actions
- Duplicate session
- Create from previous session
- Quick edit mode
- Bulk operations

### 6. Real-time Preview
- Live preview of QR code
- Map preview with zona
- Timeline visualization
- Notification preview

### 7. Collaboration
- Multi-admin editing
- Comment system
- Change history
- Approval workflow (optional)

### 8. Analytics Integration
- Predicted attendance rate
- Historical attendance data
- Student engagement metrics
- Success rate indicators

### 9. Mobile Optimization
- Touch-friendly inputs
- Swipe navigation between steps
- Camera integration for location
- GPS auto-detect

### 10. Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Font size adjustment

---

## TECHNICAL REQUIREMENTS

### Imports
```tsx
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarPlus, FileText, BookOpen, Users, Calendar, Clock,
  MapPin, Globe, Video, QrCode, Camera, Fingerprint, Smartphone,
  Wifi, Eye, EyeOff, Bell, Mail, MessageSquare, MessageCircle,
  Save, Send, ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Edit, Copy, Download, Printer, Share2, Upload, Trash2,
  Settings, Zap, TrendingUp, BarChart3, Map, Lock, Unlock,
  Timer, Repeat, Tag, AlignLeft, Key, Building, Blend
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
```

### State Management
```tsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  // Step 1
  nama_sesi: '',
  mata_kuliah_id: '',
  dosen_ids: [],
  kelas: '',
  semester: '',
  tahun_akademik: '',
  deskripsi: '',
  tags: [],
  
  // Step 2
  tanggal: '',
  waktu_mulai: '',
  waktu_selesai: '',
  waktu_buka_absen: '',
  waktu_tutup_absen: '',
  toleransi_keterlambatan: 15,
  recurring: false,
  
  // Step 3
  tipe_lokasi: 'fisik',
  ruangan_id: '',
  link_meeting: '',
  zona_lat: '',
  zona_lng: '',
  zona_radius: 100,
  
  // Step 4
  metode_absensi: [],
  qr_settings: {},
  gps_settings: {},
  selfie_settings: {},
  
  // Step 5
  status: 'published',
  visibilitas: 'all',
  mahasiswa_ids: [],
  pengaturan_absensi: {},
  penilaian: {},
  sanksi: {},
  
  // Step 6
  notifikasi_mahasiswa: true,
  notifikasi_dosen: true,
  notifikasi_admin: false,
  notifikasi_ortu: false,
  channels: [],
  timing: [],
});

const [validationErrors, setValidationErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showPreview, setShowPreview] = useState(false);
```

---

## KESIMPULAN

Halaman Create Sesi Absen Admin ini harus menjadi form wizard yang SANGAT SANGAT COMPREHENSIVE dengan:

1. **UI/UX Premium:** Mengadopsi 100% warna, gradient, dan style dari Kas Admin
2. **7-Step Wizard:** Progress stepper dengan smooth transitions
3. **Smart Forms:** Auto-complete, validation, suggestions
4. **Advanced Features:** Templates, bulk create, conflict detection
5. **Real-time Preview:** QR code, map, timeline
6. **Comprehensive Settings:** Lokasi, metode, notifikasi, sanksi
7. **Professional Animations:** Smooth transitions, hover effects
8. **Mobile Responsive:** Touch-friendly, optimized for mobile

**PENTING:**
- TIDAK BOLEH ada improvisasi warna atau style
- Semua harus PERSIS mengikuti Kas Admin
- Gunakan Framer Motion untuk semua animations
- Gunakan Lucide React icons (BUKAN emoji)
- Form validation real-time
- Auto-save draft
- Mobile responsive
- Dark mode support

**Route:**
- `/admin/sesi-absen/create` (GET)
- `/admin/sesi-absen` (POST)

Selamat mengimplementasikan! 🚀
