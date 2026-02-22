# 🎓 PROMPT ULTRA ADVANCED: ADMIN EDIT MAHASISWA UI/UX
## Full Page Design dengan Animasi & Interaksi Premium

---

## 📋 OVERVIEW SISTEM

### Tujuan Halaman
Halaman **Edit Mahasiswa** adalah interface full-page yang memungkinkan admin untuk:
- Mengubah data mahasiswa secara komprehensif
- Validasi real-time dengan feedback visual
- Upload dan crop foto profil dengan preview
- Manajemen status akademik mahasiswa
- History tracking perubahan data
- Bulk actions untuk efisiensi

### Color Scheme (Kas Admin Theme)
```typescript
const kasAdminColors = {
  primary: {
    emerald: '#10b981',      // Main action color
    emeraldDark: '#059669',  // Hover states
    emeraldLight: '#34d399', // Accents
    emeraldGlow: 'rgba(16, 185, 129, 0.2)', // Glow effects
  },
  gradients: {
    main: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    soft: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
    card: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
  },
  backgrounds: {
    dark: '#0f172a',
    darker: '#020617',
    card: '#1e293b',
    cardHover: '#334155',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
}
```

---

## 🎨 LAYOUT STRUCTURE

### Full Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR (Fixed Top)                                     │
│  - Breadcrumb Navigation                                    │
│  - Action Buttons (Save, Cancel, Delete)                    │
│  - Status Indicator                                         │
└─────────────────────────────────────────────────────────────┘
│
├─ LEFT SIDEBAR (30%)                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  PROFILE CARD                                         │ │
│  │  - Avatar Upload & Crop                               │ │
│  │  - Student Info Summary                               │ │
│  │  - Quick Stats                                        │ │
│  │  - Status Badges                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  QUICK ACTIONS                                        │ │
│  │  - Reset Password                                     │ │
│  │  - Send Notification                                  │ │
│  │  - View History                                       │ │
│  │  - Export Data                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│
├─ MAIN CONTENT (70%)                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  TABBED INTERFACE                                     │ │
│  │  ┌─────┬─────────┬──────────┬─────────┬──────────┐   │ │
│  │  │ 📝  │ 🎓      │ 📊       │ 📜      │ ⚙️       │   │ │
│  │  │ Data│ Akademik│ Kehadiran│ History │ Advanced │   │ │
│  │  └─────┴─────────┴──────────┴─────────┴──────────┘   │ │
│  │                                                       │ │
│  │  TAB CONTENT AREA                                    │ │
│  │  - Form Fields dengan Validation                     │ │
│  │  - Real-time Preview                                 │ │
│  │  - Interactive Components                            │ │
│  │  - Data Visualization                                │ │
│  └───────────────────────────────────────────────────────┘ │
│
└─ FOOTER BAR (Fixed Bottom)                                 │
   - Last Modified Info                                      │
   - Unsaved Changes Warning                                 │
   - Keyboard Shortcuts Hint                                 │
```

---

## 🎯 COMPONENT DETAILS

### 1. HEADER BAR COMPONENT

#### Design Specifications
```typescript
interface HeaderBarProps {
  studentName: string;
  studentNIM: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}
```

#### Visual Design
- **Height**: 80px
- **Background**: Gradient card dengan blur backdrop
- **Border**: Bottom border dengan emerald glow
- **Shadow**: Elevated shadow untuk depth
- **Position**: Fixed top dengan z-index 50

#### Elements:


**A. Breadcrumb Navigation**
```tsx
<div className="flex items-center gap-2 text-sm">
  <Home className="w-4 h-4 text-slate-400" />
  <ChevronRight className="w-3 h-3 text-slate-600" />
  <span className="text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">
    Mahasiswa
  </span>
  <ChevronRight className="w-3 h-3 text-slate-600" />
  <span className="text-emerald-400 font-medium">Edit</span>
  <ChevronRight className="w-3 h-3 text-slate-600" />
  <span className="text-slate-300">{studentNIM}</span>
</div>
```

**Animasi**: Fade in dari kiri dengan stagger delay

**B. Action Buttons**
```tsx
// Save Button - Primary Action
<button className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 
  rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/30 
  hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
  
  {/* Glow Effect */}
  <div className="absolute inset-0 rounded-xl bg-emerald-400 opacity-0 
    group-hover:opacity-20 blur-xl transition-opacity" />
  
  {/* Icon & Text */}
  <div className="relative flex items-center gap-2">
    {isSaving ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Menyimpan...</span>
      </>
    ) : (
      <>
        <Save className="w-5 h-5" />
        <span>Simpan Perubahan</span>
      </>
    )}
  </div>
  
  {/* Shine Effect */}
  <div className="absolute inset-0 rounded-xl overflow-hidden">
    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] 
      bg-gradient-to-r from-transparent via-white/20 to-transparent 
      transition-transform duration-1000" />
  </div>
</button>

// Cancel Button - Secondary Action
<button className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl 
  font-semibold text-slate-300 hover:text-white border border-slate-600 
  hover:border-slate-500 transition-all duration-300">
  <div className="flex items-center gap-2">
    <X className="w-5 h-5" />
    <span>Batal</span>
  </div>
</button>

// Delete Button - Danger Action
<button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl 
  font-semibold text-red-400 hover:text-red-300 border border-red-500/30 
  hover:border-red-500/50 transition-all duration-300">
  <div className="flex items-center gap-2">
    <Trash2 className="w-5 h-5" />
    <span>Hapus</span>
  </div>
</button>
```

**C. Unsaved Changes Indicator**
```tsx
{hasUnsavedChanges && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 
      border border-amber-500/30 rounded-lg"
  >
    <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
    <span className="text-sm text-amber-300">
      Ada perubahan yang belum disimpan
    </span>
  </motion.div>
)}
```

---

### 2. LEFT SIDEBAR - PROFILE CARD

#### Design Specifications
```typescript
interface ProfileCardProps {
  student: {
    id: string;
    nim: string;
    nama: string;
    email: string;
    foto?: string;
    fakultas: string;
    prodi: string;
    semester: number;
    status: 'aktif' | 'cuti' | 'lulus' | 'dropout';
    ipk: number;
    totalSKS: number;
  };
  onPhotoUpload: (file: File) => void;
  onPhotoDelete: () => void;
}
```

#### Visual Design


**A. Avatar Upload Section**
```tsx
<div className="relative group">
  {/* Avatar Container */}
  <div className="relative w-40 h-40 mx-auto">
    {/* Glow Ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-r 
      from-emerald-500 to-emerald-600 opacity-20 blur-xl 
      group-hover:opacity-40 transition-opacity" />
    
    {/* Avatar Image */}
    <div className="relative w-full h-full rounded-full overflow-hidden 
      border-4 border-emerald-500/30 group-hover:border-emerald-500/50 
      transition-all duration-300">
      {student.foto ? (
        <img 
          src={student.foto} 
          alt={student.nama}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br 
          from-emerald-500/20 to-emerald-600/10 
          flex items-center justify-center">
          <User className="w-20 h-20 text-emerald-400/50" />
        </div>
      )}
      
      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 
        group-hover:opacity-100 transition-opacity flex items-center 
        justify-center gap-2">
        <button className="p-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 
          transition-colors">
          <Upload className="w-5 h-5 text-white" />
        </button>
        {student.foto && (
          <button className="p-2 bg-red-500 rounded-lg hover:bg-red-600 
            transition-colors">
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
    
    {/* Status Badge */}
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
      <StatusBadge status={student.status} />
    </div>
  </div>
  
  {/* Upload Instructions */}
  <p className="text-center text-xs text-slate-400 mt-4">
    Klik untuk upload foto
    <br />
    Max 2MB • JPG, PNG
  </p>
</div>
```

**B. Student Info Summary**
```tsx
<div className="mt-6 space-y-4">
  {/* Name */}
  <div className="text-center">
    <h3 className="text-xl font-bold text-white">{student.nama}</h3>
    <p className="text-sm text-emerald-400 font-mono">{student.nim}</p>
  </div>
  
  {/* Quick Stats Grid */}
  <div className="grid grid-cols-2 gap-3">
    {/* IPK Card */}
    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 
      border border-emerald-500/20 rounded-xl p-4 hover:border-emerald-500/40 
      transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-400">IPK</span>
      </div>
      <div className="text-2xl font-bold text-white group-hover:text-emerald-400 
        transition-colors">
        {student.ipk.toFixed(2)}
      </div>
      <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(student.ipk / 4) * 100}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
        />
      </div>
    </div>
    
    {/* SKS Card */}
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 
      border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 
      transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-slate-400">Total SKS</span>
      </div>
      <div className="text-2xl font-bold text-white group-hover:text-blue-400 
        transition-colors">
        {student.totalSKS}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        dari 144 SKS
      </div>
    </div>
    
    {/* Semester Card */}
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 
      border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 
      transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-slate-400">Semester</span>
      </div>
      <div className="text-2xl font-bold text-white group-hover:text-purple-400 
        transition-colors">
        {student.semester}
      </div>
    </div>
    
    {/* Status Card */}
    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 
      border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 
      transition-all duration-300 group cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-slate-400">Status</span>
      </div>
      <div className="text-sm font-bold text-white group-hover:text-amber-400 
        transition-colors capitalize">
        {student.status}
      </div>
    </div>
  </div>
</div>
```

**C. Status Badge Component**
```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    aktif: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      icon: CheckCircle,
      glow: 'shadow-emerald-500/50',
    },
    cuti: {
      bg: 'bg-amber-500',
      text: 'text-white',
      icon: Pause,
      glow: 'shadow-amber-500/50',
    },
    lulus: {
      bg: 'bg-blue-500',
      text: 'text-white',
      icon: GraduationCap,
      glow: 'shadow-blue-500/50',
    },
    dropout: {
      bg: 'bg-red-500',
      text: 'text-white',
      icon: XCircle,
      glow: 'shadow-red-500/50',
    },
  };
  
  const config = statusConfig[status] || statusConfig.aktif;
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bg} 
      ${config.text} rounded-full text-xs font-semibold shadow-lg ${config.glow}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{status}</span>
    </div>
  );
};
```

---

### 3. QUICK ACTIONS PANEL

```tsx
<div className="mt-6 space-y-2">
  {/* Reset Password */}
  <button className="w-full flex items-center gap-3 px-4 py-3 
    bg-slate-800/50 hover:bg-slate-800 border border-slate-700 
    hover:border-emerald-500/50 rounded-xl transition-all duration-300 
    group">
    <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 
      transition-colors">
      <Key className="w-4 h-4 text-emerald-400" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-medium text-white">Reset Password</div>
      <div className="text-xs text-slate-400">Kirim link reset ke email</div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 
      transition-colors" />
  </button>
  
  {/* Send Notification */}
  <button className="w-full flex items-center gap-3 px-4 py-3 
    bg-slate-800/50 hover:bg-slate-800 border border-slate-700 
    hover:border-blue-500/50 rounded-xl transition-all duration-300 group">
    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 
      transition-colors">
      <Bell className="w-4 h-4 text-blue-400" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-medium text-white">Kirim Notifikasi</div>
      <div className="text-xs text-slate-400">Pesan langsung ke mahasiswa</div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 
      transition-colors" />
  </button>
  
  {/* View History */}
  <button className="w-full flex items-center gap-3 px-4 py-3 
    bg-slate-800/50 hover:bg-slate-800 border border-slate-700 
    hover:border-purple-500/50 rounded-xl transition-all duration-300 group">
    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 
      transition-colors">
      <History className="w-4 h-4 text-purple-400" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-medium text-white">Riwayat Perubahan</div>
      <div className="text-xs text-slate-400">Lihat log aktivitas</div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 
      transition-colors" />
  </button>
  
  {/* Export Data */}
  <button className="w-full flex items-center gap-3 px-4 py-3 
    bg-slate-800/50 hover:bg-slate-800 border border-slate-700 
    hover:border-amber-500/50 rounded-xl transition-all duration-300 group">
    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 
      transition-colors">
      <Download className="w-4 h-4 text-amber-400" />
    </div>
    <div className="flex-1 text-left">
      <div className="text-sm font-medium text-white">Export Data</div>
      <div className="text-xs text-slate-400">Download PDF/Excel</div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 
      transition-colors" />
  </button>
</div>
```

---

### 4. MAIN CONTENT - TABBED INTERFACE

#### Tab Navigation Design
```tsx
const tabs = [
  { id: 'data', label: 'Data Pribadi', icon: User, color: 'emerald' },
  { id: 'akademik', label: 'Akademik', icon: GraduationCap, color: 'blue' },
  { id: 'kehadiran', label: 'Kehadiran', icon: Calendar, color: 'purple' },
  { id: 'history', label: 'History', icon: History, color: 'amber' },
  { id: 'advanced', label: 'Advanced', icon: Settings, color: 'red' },
];

<div className="flex gap-2 border-b border-slate-700 mb-6">
  {tabs.map((tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`
          relative flex items-center gap-2 px-6 py-4 font-medium
          transition-all duration-300
          ${isActive 
            ? `text-${tab.color}-400` 
            : 'text-slate-400 hover:text-slate-300'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span>{tab.label}</span>
        
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className={`absolute bottom-0 left-0 right-0 h-0.5 
              bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-400`}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        
        {/* Glow Effect */}
        {isActive && (
          <div className={`absolute inset-0 bg-${tab.color}-500/5 
            rounded-t-xl -z-10`} />
        )}
      </button>
    );
  })}
</div>
```

---

### 5. TAB CONTENT: DATA PRIBADI

#### Form Layout dengan Real-time Validation


```tsx
<div className="grid grid-cols-2 gap-6">
  {/* NIM Field */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Hash className="w-4 h-4 text-emerald-400" />
      NIM (Nomor Induk Mahasiswa)
      <span className="text-red-400">*</span>
    </label>
    
    <div className="relative group">
      <input
        type="text"
        value={formData.nim}
        onChange={(e) => handleFieldChange('nim', e.target.value)}
        className={`
          w-full px-4 py-3 bg-slate-800/50 border rounded-xl
          text-white placeholder-slate-500
          focus:outline-none focus:ring-2 transition-all duration-300
          ${errors.nim 
            ? 'border-red-500/50 focus:ring-red-500/30' 
            : 'border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/30'
          }
        `}
        placeholder="Contoh: 2310140412"
      />
      
      {/* Validation Icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {validating.nim ? (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        ) : errors.nim ? (
          <XCircle className="w-5 h-5 text-red-400" />
        ) : formData.nim && (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        )}
      </div>
    </div>
    
    {/* Error Message */}
    {errors.nim && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-red-400"
      >
        <AlertCircle className="w-3 h-3" />
        <span>{errors.nim}</span>
      </motion.div>
    )}
    
    {/* Helper Text */}
    {!errors.nim && (
      <p className="text-xs text-slate-500">
        10 digit angka, harus unik
      </p>
    )}
  </div>
  
  {/* Nama Lengkap Field */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <User className="w-4 h-4 text-emerald-400" />
      Nama Lengkap
      <span className="text-red-400">*</span>
    </label>
    
    <div className="relative">
      <input
        type="text"
        value={formData.nama}
        onChange={(e) => handleFieldChange('nama', e.target.value)}
        className={`
          w-full px-4 py-3 bg-slate-800/50 border rounded-xl
          text-white placeholder-slate-500
          focus:outline-none focus:ring-2 transition-all duration-300
          ${errors.nama 
            ? 'border-red-500/50 focus:ring-red-500/30' 
            : 'border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/30'
          }
        `}
        placeholder="Contoh: Ahmad Rizki Pratama"
      />
      
      {/* Character Counter */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
        {formData.nama.length}/100
      </div>
    </div>
    
    {errors.nama && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-red-400"
      >
        <AlertCircle className="w-3 h-3" />
        <span>{errors.nama}</span>
      </motion.div>
    )}
  </div>
  
  {/* Email Field dengan Email Verification */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Mail className="w-4 h-4 text-emerald-400" />
      Email
      <span className="text-red-400">*</span>
      {formData.emailVerified && (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          Terverifikasi
        </span>
      )}
    </label>
    
    <div className="relative">
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleFieldChange('email', e.target.value)}
        className={`
          w-full px-4 py-3 bg-slate-800/50 border rounded-xl
          text-white placeholder-slate-500
          focus:outline-none focus:ring-2 transition-all duration-300
          ${errors.email 
            ? 'border-red-500/50 focus:ring-red-500/30' 
            : 'border-slate-700 focus:border-emerald-500/50 focus:ring-emerald-500/30'
          }
        `}
        placeholder="email@student.ac.id"
      />
      
      {!formData.emailVerified && formData.email && (
        <button
          onClick={handleSendVerification}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs 
            text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Kirim Verifikasi
        </button>
      )}
    </div>
    
    {errors.email && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-red-400"
      >
        <AlertCircle className="w-3 h-3" />
        <span>{errors.email}</span>
      </motion.div>
    )}
  </div>
  
  {/* Phone Number dengan Country Code */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Phone className="w-4 h-4 text-emerald-400" />
      Nomor Telepon
    </label>
    
    <div className="flex gap-2">
      {/* Country Code Selector */}
      <select className="px-3 py-3 bg-slate-800/50 border border-slate-700 
        rounded-xl text-white focus:outline-none focus:ring-2 
        focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all">
        <option value="+62">🇮🇩 +62</option>
        <option value="+1">🇺🇸 +1</option>
        <option value="+44">🇬🇧 +44</option>
      </select>
      
      {/* Phone Input */}
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => handleFieldChange('phone', e.target.value)}
        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 
          rounded-xl text-white placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
          focus:border-emerald-500/50 transition-all"
        placeholder="812-3456-7890"
      />
    </div>
  </div>
  
  {/* Tanggal Lahir dengan Date Picker */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Calendar className="w-4 h-4 text-emerald-400" />
      Tanggal Lahir
    </label>
    
    <div className="relative">
      <input
        type="date"
        value={formData.tanggalLahir}
        onChange={(e) => handleFieldChange('tanggalLahir', e.target.value)}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 
          rounded-xl text-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
          focus:border-emerald-500/50 transition-all"
      />
      
      {/* Age Display */}
      {formData.tanggalLahir && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 
          text-xs text-slate-400">
          {calculateAge(formData.tanggalLahir)} tahun
        </div>
      )}
    </div>
  </div>
  
  {/* Gender Selection dengan Custom Radio */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Users className="w-4 h-4 text-emerald-400" />
      Jenis Kelamin
    </label>
    
    <div className="flex gap-3">
      {['Laki-laki', 'Perempuan'].map((gender) => (
        <button
          key={gender}
          onClick={() => handleFieldChange('gender', gender)}
          className={`
            flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300
            ${formData.gender === gender
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {gender === 'Laki-laki' ? (
              <User className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span className="font-medium">{gender}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
  
  {/* Alamat dengan Textarea Auto-resize */}
  <div className="col-span-2 space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <MapPin className="w-4 h-4 text-emerald-400" />
      Alamat Lengkap
    </label>
    
    <textarea
      value={formData.alamat}
      onChange={(e) => handleFieldChange('alamat', e.target.value)}
      rows={3}
      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 
        rounded-xl text-white placeholder-slate-500 resize-none
        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
        focus:border-emerald-500/50 transition-all"
      placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Provinsi"
    />
    
    <div className="flex justify-between text-xs text-slate-500">
      <span>Alamat sesuai KTP</span>
      <span>{formData.alamat.length}/500</span>
    </div>
  </div>
</div>
```

---

### 6. TAB CONTENT: AKADEMIK

```tsx
<div className="space-y-6">
  {/* Program Studi Selection */}
  <div className="grid grid-cols-2 gap-6">
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Building className="w-4 h-4 text-emerald-400" />
        Fakultas
        <span className="text-red-400">*</span>
      </label>
      
      <select
        value={formData.fakultas}
        onChange={(e) => handleFieldChange('fakultas', e.target.value)}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 
          rounded-xl text-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
          focus:border-emerald-500/50 transition-all"
      >
        <option value="">Pilih Fakultas</option>
        <option value="Teknik">Fakultas Teknik</option>
        <option value="Ekonomi">Fakultas Ekonomi</option>
        <option value="Hukum">Fakultas Hukum</option>
        <option value="Kedokteran">Fakultas Kedokteran</option>
      </select>
    </div>
    
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <GraduationCap className="w-4 h-4 text-emerald-400" />
        Program Studi
        <span className="text-red-400">*</span>
      </label>
      
      <select
        value={formData.prodi}
        onChange={(e) => handleFieldChange('prodi', e.target.value)}
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 
          rounded-xl text-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30 
          focus:border-emerald-500/50 transition-all"
        disabled={!formData.fakultas}
      >
        <option value="">Pilih Program Studi</option>
        {/* Dynamic options based on fakultas */}
      </select>
    </div>
  </div>
  
  {/* Academic Status Cards */}
  <div className="grid grid-cols-3 gap-4">
    {/* Semester */}
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-500/10 rounded-lg">
          <Calendar className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <div className="text-sm text-slate-400">Semester</div>
          <div className="text-2xl font-bold text-white">{formData.semester}</div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleFieldChange('semester', formData.semester - 1)}
          disabled={formData.semester <= 1}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-lg text-white transition-colors"
        >
          <Minus className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => handleFieldChange('semester', formData.semester + 1)}
          disabled={formData.semester >= 14}
          className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-lg text-white transition-colors"
        >
          <Plus className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
    
    {/* IPK */}
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-500/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <div className="text-sm text-slate-400">IPK</div>
          <div className="text-2xl font-bold text-white">
            {formData.ipk.toFixed(2)}
          </div>
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="4"
        step="0.01"
        value={formData.ipk}
        onChange={(e) => handleFieldChange('ipk', parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
    
    {/* Total SKS */}
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <BookOpen className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <div className="text-sm text-slate-400">Total SKS</div>
          <div className="text-2xl font-bold text-white">{formData.totalSKS}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span>{Math.round((formData.totalSKS / 144) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(formData.totalSKS / 144) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          />
        </div>
      </div>
    </div>
  </div>
  
  {/* Status Akademik Selection */}
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      <Shield className="w-4 h-4 text-emerald-400" />
      Status Akademik
      <span className="text-red-400">*</span>
    </label>
    
    <div className="grid grid-cols-4 gap-3">
      {[
        { value: 'aktif', label: 'Aktif', color: 'emerald', icon: CheckCircle },
        { value: 'cuti', label: 'Cuti', color: 'amber', icon: Pause },
        { value: 'lulus', label: 'Lulus', color: 'blue', icon: GraduationCap },
        { value: 'dropout', label: 'Dropout', color: 'red', icon: XCircle },
      ].map((status) => {
        const Icon = status.icon;
        const isActive = formData.status === status.value;
        
        return (
          <button
            key={status.value}
            onClick={() => handleFieldChange('status', status.value)}
            className={`
              relative px-4 py-6 rounded-xl border-2 transition-all duration-300
              ${isActive
                ? `bg-${status.color}-500/20 border-${status.color}-500 text-${status.color}-400`
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className="w-8 h-8" />
              <span className="font-medium">{status.label}</span>
            </div>
            
            {isActive && (
              <motion.div
                layoutId="activeStatus"
                className={`absolute inset-0 bg-${status.color}-500/10 rounded-xl -z-10`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
</div>
```

---

### 7. TAB CONTENT: KEHADIRAN

```tsx
<div className="space-y-6">
  {/* Attendance Statistics */}
  <div className="grid grid-cols-4 gap-4">
    {[
      { label: 'Total Hadir', value: 45, color: 'emerald', icon: CheckCircle },
      { label: 'Izin', value: 3, color: 'blue', icon: FileText },
      { label: 'Sakit', value: 2, color: 'amber', icon: AlertCircle },
      { label: 'Alpha', value: 1, color: 'red', icon: XCircle },
    ].map((stat) => {
      const Icon = stat.icon;
      
      return (
        <div
          key={stat.label}
          className={`
            bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5
            border border-${stat.color}-500/20 rounded-xl p-6
            hover:border-${stat.color}-500/40 transition-all duration-300
          `}
        >
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-5 h-5 text-${stat.color}-400`} />
            <span className="text-sm text-slate-400">{stat.label}</span>
          </div>
          <div className={`text-3xl font-bold text-${stat.color}-400`}>
            {stat.value}
          </div>
        </div>
      );
    })}
  </div>
  
  {/* Attendance Chart */}
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">
      Grafik Kehadiran per Bulan
    </h3>
    {/* Chart component here */}
  </div>
  
  {/* Recent Attendance */}
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">
      Riwayat Kehadiran Terbaru
    </h3>
    {/* Attendance list here */}
  </div>
</div>
```

---

### 8. ANIMATIONS & TRANSITIONS

#### Page Load Animation
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};
```

#### Form Field Focus Animation
```tsx
const focusAnimation = {
  scale: [1, 1.02, 1],
  transition: { duration: 0.3 }
};
```

#### Save Button Loading State
```tsx
{isSaving && (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <Loader2 className="w-5 h-5" />
  </motion.div>
)}
```

---

### 9. VALIDATION RULES

```typescript
const validationRules = {
  nim: {
    required: true,
    pattern: /^\d{10}$/,
    unique: true,
    message: 'NIM harus 10 digit angka dan unik'
  },
  nama: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Nama harus 3-100 karakter, hanya huruf dan spasi'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true,
    message: 'Format email tidak valid'
  },
  phone: {
    pattern: /^[0-9]{10,13}$/,
    message: 'Nomor telepon harus 10-13 digit'
  }
};
```

---

### 10. KEYBOARD SHORTCUTS

```typescript
const shortcuts = {
  'Ctrl+S': 'Simpan perubahan',
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
  'Esc': 'Batal/Tutup',
  'Tab': 'Navigasi field',
  'Ctrl+K': 'Quick search'
};
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Core Structure
- [ ] Setup page layout dengan sidebar & main content
- [ ] Implement header bar dengan action buttons
- [ ] Create profile card component
- [ ] Build tab navigation system

### Phase 2: Form Components
- [ ] Build all form fields dengan validation
- [ ] Implement real-time validation
- [ ] Add error handling & display
- [ ] Create custom input components

### Phase 3: Advanced Features
- [ ] Photo upload & crop functionality
- [ ] History tracking system
- [ ] Quick actions panel
- [ ] Keyboard shortcuts

### Phase 4: Polish & Optimization
- [ ] Add all animations & transitions
- [ ] Implement loading states
- [ ] Add success/error notifications
- [ ] Performance optimization
- [ ] Accessibility improvements

---

## 📱 RESPONSIVE DESIGN

### Mobile (< 768px)
- Stack sidebar below header
- Single column form layout
- Simplified tab navigation
- Touch-optimized buttons

### Tablet (768px - 1024px)
- Sidebar width: 35%
- Two-column form layout
- Full tab navigation

### Desktop (> 1024px)
- Sidebar width: 30%
- Two-column form layout
- All features visible

---

## 🎭 MICRO-INTERACTIONS

1. **Button Hover**: Scale 1.05 + glow effect
2. **Input Focus**: Border glow + scale 1.02
3. **Tab Switch**: Smooth slide animation
4. **Save Success**: Confetti animation
5. **Error Shake**: Shake animation on validation error
6. **Loading Pulse**: Skeleton loading states

---

## 🔧 TECHNICAL REQUIREMENTS

### Dependencies
```json
{
  "framer-motion": "^10.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "react-dropzone": "^14.x",
  "react-image-crop": "^10.x",
  "lucide-react": "^0.x"
}
```

### API Endpoints
```typescript
PUT /api/admin/mahasiswa/:id
GET /api/admin/mahasiswa/:id/history
POST /api/admin/mahasiswa/:id/photo
DELETE /api/admin/mahasiswa/:id
POST /api/admin/mahasiswa/:id/reset-password
```

---

## 🎨 FINAL NOTES

Halaman ini dirancang untuk memberikan pengalaman editing yang:
- **Intuitif**: Layout yang jelas dan mudah dipahami
- **Efisien**: Quick actions dan keyboard shortcuts
- **Aman**: Validasi real-time dan konfirmasi untuk aksi penting
- **Indah**: Animasi smooth dan color scheme yang konsisten
- **Responsif**: Bekerja sempurna di semua device

Gunakan warna emerald/green dari Kas Admin theme untuk konsistensi visual dengan menu lainnya!
