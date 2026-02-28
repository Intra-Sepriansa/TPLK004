# PROMPT: PROFILE MAHASISWA - ULTRA ADVANCED COMPLETE REDESIGN

## 🎯 TUJUAN UTAMA
Merapikan dan mengembangkan menu **Profile Mahasiswa** (`resources/js/pages/user/profile.tsx`) dengan standar ultra-advanced yang sangat krusial dan penting. Menu ini harus menjadi pusat manajemen akun yang lengkap, rapi, dan mudah digunakan dengan UI/UX yang matching dengan Dashboard Admin dan menu-menu lain yang sudah ada.

## 📋 REFERENSI UTAMA
- **Profile Dosen**: `resources/js/pages/dosen/profile.tsx` (layout, UI/UX, animasi yang lengkap)
- **Dashboard Admin**: `resources/js/pages/admin/command-center.tsx` (warna, animasi, glassmorphism)
- **Dashboard Mahasiswa**: `resources/js/pages/user/dashboard.tsx` (UI/UX pattern, responsive)
- **Menu Lain**: Konsistensi dengan semua menu mahasiswa yang sudah ada

## 🎨 DESAIN & UI/UX REQUIREMENTS

### 1. HERO PROFILE CARD (CRITICAL - Matching Dosen Profile)
**Banner Gradient dengan Animasi:**
```tsx
// WAJIB menggunakan pattern ini (dari dosen profile):
<div className="relative h-44 md:h-56 overflow-hidden">
  <motion.div 
    className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    style={{ backgroundSize: '200% 200%' }}
  />
  
  {/* Decorative elements */}
  <div className="absolute inset-0 opacity-20" 
    style={{ 
      backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', 
      backgroundSize: '40px 40px, 60px 60px' 
    }} 
  />
  
  {/* Glow orbs */}
  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
  <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />
  <div className="absolute right-1/3 top-1/3 h-32 w-32 rounded-full bg-indigo-300/15 blur-3xl" />
  
  {/* Animated floating orbs */}
  {[0, 1, 2].map(i => (
    <motion.div 
      key={i}
      className="absolute rounded-full bg-white/10"
      style={{ 
        width: 12 + i * 8, 
        height: 12 + i * 8, 
        left: `${20 + i * 30}%`, 
        top: `${30 + i * 15}%` 
      }}
      animate={{ 
        y: [0, -20, 0], 
        opacity: [0.3, 0.6, 0.3] 
      }}
      transition={{ 
        duration: 3 + i, 
        repeat: Infinity, 
        ease: 'easeInOut', 
        delay: i * 0.5 
      }}
    />
  ))}
</div>
```

**Avatar Section:**
```tsx
// Avatar overlapping banner dengan glow effect
<div className="flex flex-col items-center -mt-16 md:-mt-20">
  <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
    {/* Glow ring */}
    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
    
    {/* Avatar container */}
    <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden border-4 border-white dark:border-neutral-950 shadow-2xl">
      <img src={avatarUrl} alt={mahasiswa.nama} className="h-full w-full object-cover" />
      
      {/* Hover overlay for camera */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        onClick={() => avatarInputRef.current?.click()}>
        <Camera className="h-6 w-6 text-white" />
      </div>
    </div>
    
    {/* Verified badge */}
    <motion.div 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      transition={{ delay: 0.5, type: 'spring' }}
      className="absolute -bottom-1 -right-1 h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 border-3 border-white dark:border-neutral-950 flex items-center justify-center shadow-lg">
      <CheckCircle2 className="h-5 w-5 text-white" />
    </motion.div>
  </motion.div>
</div>
```

**❌ HAPUS:**
- Container/background di belakang icon header
- Animasi icon yang bergerak naik-turun
- Icon yang tidak matching dengan tema

**✅ GUNAKAN:**
- Icon PNG dari assets (profileIcon)
- Proper sizing dan positioning
- Glow effects dan animations

### 2. PROFILE INFO SECTION
**Name & Status:**
```tsx
<div className="mt-4 text-center space-y-2">
  <div className="flex items-center justify-center gap-2">
    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
      {mahasiswa.nama}
    </h1>
    <motion.div 
      animate={{ rotate: [0, 10, -10, 0] }} 
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
      <Sparkles className="h-5 w-5 text-amber-500" />
    </motion.div>
  </div>
  
  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
    @{mahasiswa.nim}
  </p>
  
  <p className="text-sm text-neutral-600 dark:text-neutral-300">
    Mahasiswa Aktif
  </p>
</div>
```

**Info Pills:**
```tsx
<div className="flex flex-wrap items-center justify-center gap-2 mt-3">
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
    <Mail className="h-3 w-3" />
    {mahasiswa.email}
  </div>
  
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
    <IdCard className="h-3 w-3" />
    {mahasiswa.nim}
  </div>
  
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
    Aktif
  </div>
</div>
```

**Action Buttons:**
```tsx
<div className="flex items-center justify-center gap-3 mt-4">
  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
    <Button 
      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow px-6"
      onClick={() => setActiveTab('edit')}>
      <Edit3 className="h-4 w-4 mr-2" /> Edit Profil
    </Button>
  </motion.div>
  
  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
    <Button 
      variant="outline" 
      className="border-neutral-300 dark:border-neutral-700 px-6" 
      onClick={() => avatarInputRef.current?.click()}>
      <Camera className="h-4 w-4 mr-2" /> Ganti Foto
    </Button>
  </motion.div>
</div>
```


**Name & Info Section:**
```tsx
<div className="mt-4 text-center space-y-2">
  <div className="flex items-center justify-center gap-2">
    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
      {mahasiswa.nama}
    </h1>
    <motion.div 
      animate={{ rotate: [0, 10, -10, 0] }} 
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Sparkles className="h-5 w-5 text-amber-500" />
    </motion.div>
  </div>
  
  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
    @{mahasiswa.nim}
  </p>
  <p className="text-sm text-neutral-600 dark:text-neutral-300">
    Mahasiswa Aktif
  </p>
  
  {/* Info pills */}
  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
      <Mail className="h-3 w-3" />
      {mahasiswa.email || 'Email belum diatur'}
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
      <IdCard className="h-3 w-3" />
      NIM: {mahasiswa.nim}
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      Aktif
    </div>
  </div>
  
  {/* Action buttons */}
  <div className="flex items-center justify-center gap-3 mt-4">
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button 
        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow px-6"
        onClick={() => setActiveTab('edit')}
      >
        <Edit3 className="h-4 w-4 mr-2" /> Edit Profil
      </Button>
    </motion.div>
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Button 
        variant="outline" 
        className="border-neutral-300 dark:border-neutral-700 px-6" 
        onClick={() => avatarInputRef.current?.click()}
      >
        <Camera className="h-4 w-4 mr-2" /> Ganti Foto
      </Button>
    </motion.div>
  </div>
</div>
```

### 2. QUICK STATS SECTION (Di bawah Hero Card)
**Grid 3 Kolom dengan Animasi:**
```tsx
<div className="mt-6 grid grid-cols-3 gap-4">
  {[
    { 
      label: 'Total Kehadiran', 
      value: stats.totalAttendance, 
      icon: CheckCircle2,
      color: 'from-emerald-400 to-teal-600',
      delay: 0.6 
    },
    { 
      label: 'Rata-rata', 
      value: `${stats.attendanceRate}%`, 
      icon: TrendingUp,
      color: 'from-blue-400 to-indigo-600',
      delay: 0.65 
    },
    { 
      label: 'Streak', 
      value: `${stats.currentStreak} hari`, 
      icon: Flame,
      color: 'from-amber-400 to-orange-600',
      delay: 0.7 
    },
  ].map((stat) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stat.delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-purple-100">{stat.label}</p>
        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
          <stat.icon className="h-3 w-3 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{stat.value}</p>
    </motion.div>
  ))}
</div>
```

### 3. BADGES/ACHIEVEMENTS SECTION
**Matching dengan Dashboard:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
>
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      >
        <Trophy className="h-5 w-5" />
      </motion.div>
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">Pencapaian</h2>
        <p className="text-sm text-slate-500">
          {badges.filter(b => b.unlocked).length} dari {badges.length} badge terbuka
        </p>
      </div>
    </div>
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href="/user/achievements"
        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
      >
        Lihat Semua
        <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  </div>

  {/* Badges Grid dengan animasi stagger */}
  <div className="flex flex-wrap gap-3">
    {badges.slice(0, 8).map((badge, index) => {
      const isCompleted = badge.progress >= badge.target;
      const shouldShow = badge.unlocked || isCompleted;

      return (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.4 + index * 0.05, 
            type: "spring", 
            stiffness: 200 
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => router.get(`/user/achievements/${badge.type}`)}
          className={cn(
            'group relative cursor-pointer',
            !shouldShow && 'opacity-40 grayscale'
          )}
          title={`${badge.name} - Lv ${badge.level}/${badge.maxLevel}`}
        >
          <div className="h-14 w-14 transition-transform">
            {shouldShow ? (
              <BadgeImageProfile
                icon={badge.icon}
                name={badge.name}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {badge.name}
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
</motion.div>
```

### 4. TAB NAVIGATION
**4 Tabs dengan Animasi:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-1.5 backdrop-blur-xl shadow-lg"
>
  <div className="flex gap-1">
    {tabs.map((tab, index) => {
      const Icon = tab.icon;
      return (
        <motion.button
          key={tab.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
            activeTab === tab.key
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </motion.button>
      );
    })}
  </div>
</motion.div>
```

**Tabs Configuration:**
```tsx
const tabs = [
  { 
    key: 'overview' as TabType, 
    label: 'Overview', 
    icon: User, 
    desc: 'Ringkasan profil' 
  },
  { 
    key: 'card' as TabType, 
    label: 'Kartu Profil', 
    icon: CreditCard, 
    desc: 'Kartu interaktif' 
  },
  { 
    key: 'edit' as TabType, 
    label: 'Edit Profil', 
    icon: Edit3, 
    desc: 'Ubah data diri' 
  },
  { 
    key: 'security' as TabType, 
    label: 'Keamanan', 
    icon: Shield, 
    desc: 'Password & akses' 
  },
];
```


### 3. QUICK STATS SECTION (Below Avatar)
**Stats Grid:**
```tsx
<div className="mt-6 grid grid-cols-3 gap-4 px-6">
  {[
    { 
      label: 'Total Kehadiran', 
      value: stats.totalAttendance, 
      icon: CheckCircle2,
      color: 'from-emerald-400 to-teal-600'
    },
    { 
      label: 'Rata-rata', 
      value: `${stats.attendanceRate}%`, 
      icon: TrendingUp,
      color: 'from-blue-400 to-indigo-600'
    },
    { 
      label: 'Streak', 
      value: `${stats.currentStreak} hari`, 
      icon: Flame,
      color: 'from-amber-400 to-orange-600'
    },
  ].map((stat, index) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="rounded-xl bg-white/10 backdrop-blur p-3 cursor-pointer group"
    >
      <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} mb-2 mx-auto group-hover:scale-110 transition-transform`}>
        <stat.icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
        {stat.label}
      </p>
      <p className="text-xl font-bold text-neutral-900 dark:text-white text-center">
        {stat.value}
      </p>
    </motion.div>
  ))}
</div>
```

### 4. BADGES/ACHIEVEMENTS SECTION
**Matching dengan Dashboard:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl"
>
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      >
        <Trophy className="h-5 w-5" />
      </motion.div>
      <div>
        <h2 className="font-semibold text-neutral-900 dark:text-white">
          Pencapaian
        </h2>
        <p className="text-sm text-neutral-500">
          {badges.filter(b => b.unlocked).length} dari {badges.length} badge terbuka
        </p>
      </div>
    </div>
    
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href="/user/achievements"
        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
      >
        Lihat Semua
        <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.div>
  </div>

  {/* Badges Grid dengan animasi stagger */}
  <div className="flex flex-wrap gap-3">
    {badges.slice(0, 8).map((badge, index) => {
      const isCompleted = badge.progress >= badge.target;
      const shouldShow = badge.unlocked || isCompleted;

      return (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.4 + index * 0.05, 
            type: "spring", 
            stiffness: 200 
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => router.get(`/user/achievements/${badge.type}`)}
          className={cn(
            'group relative cursor-pointer',
            !shouldShow && 'opacity-40 grayscale'
          )}
          title={`${badge.name} - Lv ${badge.level}/${badge.maxLevel}`}
        >
          <div className="h-14 w-14 transition-transform">
            {shouldShow ? (
              <BadgeImageProfile icon={badge.icon} name={badge.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <Lock className="h-4 w-4 text-neutral-400" />
              </div>
            )}
          </div>
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {badge.name}
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
</motion.div>
```

### 5. TAB NAVIGATION (4 Tabs)
**Matching Dosen Profile:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-1.5 shadow-lg"
>
  <div className="flex gap-1">
    {tabs.map((tab, index) => {
      const Icon = tab.icon;
      return (
        <motion.button
          key={tab.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
            activeTab === tab.key
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </motion.button>
      );
    })}
  </div>
</motion.div>
```

**Tabs Configuration:**
```tsx
const tabs = [
  { 
    key: 'overview' as TabType, 
    label: 'Overview', 
    icon: User, 
    desc: 'Ringkasan profil' 
  },
  { 
    key: 'card' as TabType, 
    label: 'Kartu Profil', 
    icon: CreditCard, 
    desc: 'Kartu interaktif' 
  },
  { 
    key: 'edit' as TabType, 
    label: 'Edit Profil', 
    icon: Edit3, 
    desc: 'Ubah data diri' 
  },
  { 
    key: 'security' as TabType, 
    label: 'Keamanan', 
    icon: Shield, 
    desc: 'Password & akses' 
  },
];
```

### 6. TAB CONTENT - OVERVIEW
**Personal Information Card:**
```tsx
<div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
  <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
      <User className="h-4 w-4 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
        Informasi Personal
      </h3>
      <p className="text-[11px] text-neutral-500">Data diri mahasiswa</p>
    </div>
  </div>
  
  <div className="p-5 space-y-4">
    {[
      { icon: User, label: 'Nama Lengkap', val: mahasiswa.nama },
      { icon: IdCard, label: 'NIM', val: mahasiswa.nim },
      { icon: Mail, label: 'Email', val: mahasiswa.email || 'Belum diatur' },
      { icon: Phone, label: 'Telepon', val: mahasiswa.phone || 'Belum diatur' },
      { icon: Calendar, label: 'Angkatan', val: mahasiswa.angkatan || '-' },
      { icon: BookOpen, label: 'Program Studi', val: mahasiswa.prodi || '-' },
    ].map((inf, i) => (
      <div 
        key={i} 
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
      >
        <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-violet-500 transition-colors">
          <inf.icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {inf.label}
          </p>
          <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
            {inf.val}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ))}
  </div>
</div>
```

**Academic Stats Card:**
```tsx
<div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
  <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
      <TrendingUp className="h-4 w-4 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
        Statistik Akademik
      </h3>
      <p className="text-[11px] text-neutral-500">Performa kuliah</p>
    </div>
  </div>
  
  <div className="p-5 space-y-3">
    {[
      { 
        icon: CheckCircle2, 
        label: 'Total Kehadiran', 
        val: `${stats.totalAttendance} sesi`, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
      },
      { 
        icon: TrendingUp, 
        label: 'Persentase Hadir', 
        val: `${stats.attendanceRate}%`, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/20' 
      },
      { 
        icon: Flame, 
        label: 'Streak Saat Ini', 
        val: `${stats.currentStreak} hari`, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50 dark:bg-amber-900/20' 
      },
      { 
        icon: Target, 
        label: 'Tepat Waktu', 
        val: `${stats.onTimeRate}%`, 
        color: 'text-purple-500', 
        bg: 'bg-purple-50 dark:bg-purple-900/20' 
      },
    ].map((stat, i) => (
      <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${stat.bg}`}>
        <stat.icon className={`h-5 w-5 ${stat.color}`} />
        <div className="flex-1">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {stat.label}
          </p>
        </div>
        <span className={`font-bold text-sm ${stat.color}`}>{stat.val}</span>
      </div>
    ))}
  </div>
</div>
```

**Account Status Card:**
```tsx
<div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
  <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
      <Shield className="h-4 w-4 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
        Status Akun
      </h3>
      <p className="text-[11px] text-neutral-500">Keamanan & verifikasi</p>
    </div>
  </div>
  
  <div className="p-5 space-y-3">
    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-800/30">
      <div className="flex items-center gap-3">
        <BadgeCheck className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Akun Terverifikasi
        </span>
      </div>
      <Badge className="bg-emerald-500 text-white border-0">Active</Badge>
    </div>
    
    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Password
        </span>
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-7 text-xs" 
        onClick={() => setActiveTab('security')}
      >
        Ubah
      </Button>
    </div>
    
    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Two-Factor Auth
        </span>
      </div>
      <Badge variant="outline" className="text-xs">Coming Soon</Badge>
    </div>
  </div>
</div>
```


### 5. TAB CONTENT - OVERVIEW
**Grid 2 Kolom (Personal Info + Activity):**
```tsx
{activeTab === 'overview' && (
  <motion.div 
    key="overview" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }} 
    className="grid grid-cols-1 lg:grid-cols-2 gap-5"
  >
    {/* Personal Information */}
    <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
          <User className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Informasi Personal
          </h3>
          <p className="text-[11px] text-neutral-500">Data diri mahasiswa</p>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {[
          { icon: User, label: 'Nama Lengkap', val: mahasiswa.nama },
          { icon: IdCard, label: 'NIM', val: mahasiswa.nim },
          { icon: Mail, label: 'Email', val: mahasiswa.email || 'Belum diatur' },
          { icon: Phone, label: 'Telepon', val: mahasiswa.phone || 'Belum diatur' },
          { icon: Calendar, label: 'Angkatan', val: mahasiswa.angkatan || '2024' },
          { icon: BookOpen, label: 'Program Studi', val: mahasiswa.prodi || 'Teknik Informatika' },
        ].map((inf, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
          >
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-violet-500 transition-colors">
              <inf.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {inf.label}
              </p>
              <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                {inf.val}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>

    {/* Activity & Achievements */}
    <div className="space-y-5">
      {/* Academic Stats */}
      <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Statistik Akademik
            </h3>
            <p className="text-[11px] text-neutral-500">Performa kuliah</p>
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          {[
            { 
              icon: CheckCircle2, 
              label: 'Total Kehadiran', 
              val: `${stats.totalAttendance} sesi`, 
              color: 'text-emerald-500', 
              bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
            },
            { 
              icon: TrendingUp, 
              label: 'Persentase Hadir', 
              val: `${stats.attendanceRate}%`, 
              color: 'text-blue-500', 
              bg: 'bg-blue-50 dark:bg-blue-900/20' 
            },
            { 
              icon: Flame, 
              label: 'Streak Saat Ini', 
              val: `${stats.currentStreak} hari`, 
              color: 'text-amber-500', 
              bg: 'bg-amber-50 dark:bg-amber-900/20' 
            },
            { 
              icon: Target, 
              label: 'Tepat Waktu', 
              val: `${stats.onTimeRate}%`, 
              color: 'text-purple-500', 
              bg: 'bg-purple-50 dark:bg-purple-900/20' 
            },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {stat.label}
                </p>
              </div>
              <span className={`font-bold text-sm ${stat.color}`}>
                {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Status Akun
            </h3>
            <p className="text-[11px] text-neutral-500">Keamanan & verifikasi</p>
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-800/30">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Akun Terverifikasi
              </span>
            </div>
            <Badge className="bg-emerald-500 text-white border-0">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs" 
              onClick={() => setActiveTab('security')}
            >
              Ubah
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Terakhir Login
              </span>
            </div>
            <span className="text-xs text-neutral-500">
              {new Date().toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

### 6. TAB CONTENT - CARD (Profile Card Interactive)
```tsx
{activeTab === 'card' && (
  <motion.div 
    key="card" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center py-10"
  >
    <ProfileCard
      name={mahasiswa.nama}
      title="Mahasiswa"
      handle={mahasiswa.nim}
      status="Aktif"
      avatarUrl={avatarUrl}
      contactText="Edit Profil"
      showUserInfo={true}
      enableTilt={true}
      behindGlowColor="rgba(139, 92, 246, 0.6)"
      innerGradient="linear-gradient(145deg, #6366f144 0%, #a855f744 100%)"
      onContactClick={() => setActiveTab('edit')}
    />
    <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
      Gerakkan mouse di atas kartu untuk efek 3D interaktif. Klik tombol untuk mengedit profil.
    </p>
  </motion.div>
)}
```

### 7. TAB CONTENT - EDIT PROFILE
```tsx
{activeTab === 'edit' && (
  <motion.div 
    key="edit" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
  >
    <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
          <Edit3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Edit Profil
          </h3>
          <p className="text-xs text-neutral-500">
            Perbarui informasi personal Anda
          </p>
        </div>
      </div>
      
      <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
          <div className="relative group">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-lg">
              <img 
                src={avatarUrl} 
                alt={mahasiswa.nama} 
                className="h-full w-full object-cover" 
              />
            </div>
            <button 
              type="button" 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">Foto Profil</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              JPG, PNG max 2MB. Disarankan 400x400px.
            </p>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              className="mt-2 h-8 text-xs" 
              onClick={() => avatarInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1.5" /> Pilih Foto
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-slate-700 dark:text-white">
              Nama Lengkap
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="nama"
                value={profileForm.data.nama}
                onChange={e => profileForm.setData('nama', e.target.value)}
                className="pl-10"
                placeholder="Nama lengkap"
              />
            </div>
            <InputError message={profileForm.errors.nama} />
          </div>

          {/* NIM (Disabled) */}
          <div className="space-y-2">
            <Label htmlFor="nim" className="text-slate-700 dark:text-white">
              NIM
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="nim"
                value={mahasiswa.nim}
                disabled
                className="pl-10 bg-slate-50 dark:bg-black"
              />
            </div>
            <p className="text-xs text-slate-500">NIM tidak dapat diubah</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={profileForm.data.email}
                onChange={e => profileForm.setData('email', e.target.value)}
                className="pl-10"
                placeholder="email@example.com"
              />
            </div>
            <InputError message={profileForm.errors.email} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 dark:text-white">
              Nomor Telepon
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                value={profileForm.data.phone}
                onChange={e => profileForm.setData('phone', e.target.value)}
                className="pl-10"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <InputError message={profileForm.errors.phone} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-purple-500/40"
            disabled={profileForm.processing}
          >
            {profileForm.processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => profileForm.reset()}
            disabled={profileForm.processing}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
        </div>
      </form>
    </div>
  </motion.div>
)}
```


### 7. TAB CONTENT - CARD (Profile Card 3D)
**Interactive 3D Card:**
```tsx
{activeTab === 'card' && (
  <motion.div 
    key="card" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
    className="flex flex-col items-center justify-center py-10"
  >
    <ProfileCard
      name={mahasiswa.nama}
      title="Mahasiswa"
      handle={mahasiswa.nim}
      status="Aktif"
      avatarUrl={avatarUrl}
      contactText="Edit Profil"
      showUserInfo={true}
      enableTilt={true}
      behindGlowColor="rgba(16, 185, 129, 0.6)"
      innerGradient="linear-gradient(145deg, #10b98144 0%, #14b8a644 100%)"
      onContactClick={() => setActiveTab('edit')}
    />
    
    <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
      Gerakkan mouse di atas kartu untuk efek 3D interaktif. Klik tombol untuk mengedit profil.
    </p>
  </motion.div>
)}
```

### 8. TAB CONTENT - EDIT PROFILE
**Edit Form dengan Avatar Upload:**
```tsx
{activeTab === 'edit' && (
  <motion.div 
    key="edit" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
  >
    <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
          <Edit3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Edit Profil
          </h3>
          <p className="text-xs text-neutral-500">
            Perbarui informasi personal Anda
          </p>
        </div>
      </div>
      
      <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
          <div className="relative group">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-lg">
              <img src={avatarUrl} alt={mahasiswa.nama} className="h-full w-full object-cover" />
            </div>
            <button 
              type="button" 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
          
          <div className="flex-1">
            <p className="font-bold text-neutral-900 dark:text-white">Foto Profil</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              JPG, PNG max 2MB. Disarankan 400x400px.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="h-8 text-xs" 
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                Pilih Foto
              </Button>
              
              {avatarPreview && (
                <Button 
                  type="button" 
                  size="sm" 
                  className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600" 
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-neutral-700 dark:text-white">
              Nama Lengkap
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id="nama"
                value={profileForm.data.nama}
                onChange={e => profileForm.setData('nama', e.target.value)}
                className="pl-10"
                placeholder="Nama lengkap"
              />
            </div>
            <InputError message={profileForm.errors.nama} />
          </div>
          
          {/* NIM (Disabled) */}
          <div className="space-y-2">
            <Label htmlFor="nim" className="text-neutral-700 dark:text-white">
              NIM
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id="nim"
                value={mahasiswa.nim}
                disabled
                className="pl-10 bg-neutral-50 dark:bg-black cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-neutral-500">NIM tidak dapat diubah</p>
          </div>
          
          {/* Email */}
          {mahasiswa.email && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700 dark:text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="email"
                  value={mahasiswa.email}
                  disabled
                  className="pl-10 bg-neutral-50 dark:bg-black cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-neutral-500">Email tidak dapat diubah</p>
            </div>
          )}
          
          {/* Phone (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-neutral-700 dark:text-white">
              Nomor Telepon <span className="text-neutral-400">(Opsional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                id="phone"
                value={profileForm.data.phone}
                onChange={e => profileForm.setData('phone', e.target.value)}
                className="pl-10"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <InputError message={profileForm.errors.phone} />
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-purple-500/40"
            disabled={profileForm.processing}
          >
            {profileForm.processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => profileForm.reset()}
            disabled={profileForm.processing}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
        </div>
      </form>
    </div>
  </motion.div>
)}
```

### 9. TAB CONTENT - SECURITY
**Password Change Form:**
```tsx
{activeTab === 'security' && (
  <motion.div 
    key="security" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
  >
    <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Keamanan Akun
          </h3>
          <p className="text-xs text-neutral-500">
            Ubah password dan kelola keamanan akun
          </p>
        </div>
      </div>
      
      <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current_password" className="text-neutral-700 dark:text-white">
            Password Saat Ini
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="current_password"
              type={showCurrent ? 'text' : 'password'}
              value={passwordForm.data.current_password}
              onChange={e => passwordForm.setData('current_password', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password saat ini"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.current_password} />
        </div>
        
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-neutral-700 dark:text-white">
            Password Baru
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="password"
              type={showNew ? 'text' : 'password'}
              value={passwordForm.data.password}
              onChange={e => passwordForm.setData('password', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password baru"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.password} />
          
          {/* Password Strength Indicator */}
          {passwordForm.data.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Kekuatan Password:</span>
                <span className={cn(
                  "font-semibold",
                  passwordForm.data.password.length < 8 ? "text-red-500" :
                  passwordForm.data.password.length < 12 ? "text-amber-500" :
                  "text-emerald-500"
                )}>
                  {passwordForm.data.password.length < 8 ? "Lemah" :
                   passwordForm.data.password.length < 12 ? "Sedang" :
                   "Kuat"}
                </span>
              </div>
              <Progress 
                value={Math.min((passwordForm.data.password.length / 12) * 100, 100)} 
                className="h-2"
              />
            </div>
          )}
        </div>
        
        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-neutral-700 dark:text-white">
            Konfirmasi Password Baru
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="password_confirmation"
              type={showConfirm ? 'text' : 'password'}
              value={passwordForm.data.password_confirmation}
              onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Konfirmasi password baru"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.password_confirmation} />
        </div>
        
        {/* Security Tips */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Tips Keamanan Password:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Minimal 8 karakter, disarankan 12+ karakter</li>
                <li>• Kombinasi huruf besar, kecil, angka, dan simbol</li>
                <li>• Jangan gunakan informasi personal (nama, tanggal lahir)</li>
                <li>• Gunakan password yang berbeda untuk setiap akun</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-red-500/40"
            disabled={passwordForm.processing}
          >
            {passwordForm.processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengubah Password...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Ubah Password
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => passwordForm.reset()}
            disabled={passwordForm.processing}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
        </div>
      </form>
    </div>
  </motion.div>
)}
```


### 8. TAB CONTENT - SECURITY (Password & 2FA)
```tsx
{activeTab === 'security' && (
  <motion.div 
    key="security" 
    initial={{ opacity: 0, y: 12 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -12 }} 
    transition={{ duration: 0.25 }}
    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
  >
    {/* Change Password Form */}
    <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600">
          <KeyRound className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Ubah Password
          </h3>
          <p className="text-xs text-neutral-500">
            Pastikan password Anda kuat dan aman
          </p>
        </div>
      </div>
      
      <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current_password" className="text-slate-700 dark:text-white">
            Password Saat Ini
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="current_password"
              type={showCurrent ? 'text' : 'password'}
              value={passwordForm.data.current_password}
              onChange={e => passwordForm.setData('current_password', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password saat ini"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.current_password} />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 dark:text-white">
            Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showNew ? 'text' : 'password'}
              value={passwordForm.data.password}
              onChange={e => passwordForm.setData('password', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password baru"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.password} />
          
          {/* Password Strength Indicator */}
          {passwordForm.data.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Kekuatan Password</span>
                <span className={cn(
                  "font-semibold",
                  passwordForm.data.password.length < 8 ? "text-red-500" :
                  passwordForm.data.password.length < 12 ? "text-amber-500" :
                  "text-emerald-500"
                )}>
                  {passwordForm.data.password.length < 8 ? "Lemah" :
                   passwordForm.data.password.length < 12 ? "Sedang" :
                   "Kuat"}
                </span>
              </div>
              <Progress 
                value={Math.min((passwordForm.data.password.length / 12) * 100, 100)} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-white">
            Konfirmasi Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password_confirmation"
              type={showConfirm ? 'text' : 'password'}
              value={passwordForm.data.password_confirmation}
              onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
              className="pl-10 pr-10"
              placeholder="Konfirmasi password baru"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <InputError message={passwordForm.errors.password_confirmation} />
        </div>

        {/* Password Requirements */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Persyaratan Password:
          </p>
          <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-3 w-3",
                passwordForm.data.password.length >= 8 ? "text-emerald-500" : "text-slate-300"
              )} />
              Minimal 8 karakter
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-3 w-3",
                /[A-Z]/.test(passwordForm.data.password) ? "text-emerald-500" : "text-slate-300"
              )} />
              Mengandung huruf besar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-3 w-3",
                /[a-z]/.test(passwordForm.data.password) ? "text-emerald-500" : "text-slate-300"
              )} />
              Mengandung huruf kecil
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className={cn(
                "h-3 w-3",
                /[0-9]/.test(passwordForm.data.password) ? "text-emerald-500" : "text-slate-300"
              )} />
              Mengandung angka
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg hover:shadow-rose-500/40"
          disabled={passwordForm.processing}
        >
          {passwordForm.processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengubah Password...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Ubah Password
            </>
          )}
        </Button>
      </form>
    </div>

    {/* Security Info & 2FA */}
    <div className="space-y-6">
      {/* Security Tips */}
      <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Tips Keamanan
            </h3>
            <p className="text-xs text-neutral-500">
              Lindungi akun Anda
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            {
              icon: CheckCircle2,
              title: 'Gunakan Password Kuat',
              desc: 'Kombinasi huruf besar, kecil, angka, dan simbol',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20'
            },
            {
              icon: AlertCircle,
              title: 'Jangan Bagikan Password',
              desc: 'Jangan pernah memberikan password ke siapapun',
              color: 'text-rose-500',
              bg: 'bg-rose-50 dark:bg-rose-900/20'
            },
            {
              icon: RefreshCw,
              title: 'Ubah Password Berkala',
              desc: 'Ganti password setiap 3-6 bulan sekali',
              color: 'text-blue-500',
              bg: 'bg-blue-50 dark:bg-blue-900/20'
            },
            {
              icon: Lock,
              title: 'Logout Setelah Selesai',
              desc: 'Selalu logout saat menggunakan komputer umum',
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-900/20'
            },
          ].map((tip, i) => (
            <div key={i} className={`flex gap-4 p-4 rounded-xl ${tip.bg}`}>
              <tip.icon className={`h-5 w-5 ${tip.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {tip.title}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {tip.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Factor Authentication (Coming Soon) */}
      <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-neutral-500">
              Keamanan ekstra untuk akun Anda
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8">
            <div className="inline-flex p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
              Segera Hadir!
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
              Fitur Two-Factor Authentication akan segera tersedia untuk meningkatkan keamanan akun Anda.
            </p>
            <Badge className="mt-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

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
```

### Success Toast Animation
```tsx
<AnimatePresence>
  {(successMessage || (showFlash && flash?.success)) && (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className="fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
    >
      <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
      </div>
      <div>
        <p className="font-bold">Berhasil!</p>
        <p className="text-xs opacity-80">{successMessage || flash?.success}</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Avatar Upload Animation
```tsx
<AnimatePresence>
  {avatarPreview && (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 10 }} 
      className="flex gap-2 mt-3"
    >
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg" 
        onClick={handleAvatarUpload} 
        disabled={isUploadingAvatar}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        {isUploadingAvatar ? 'Mengunggah...' : 'Simpan Foto'}
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => { 
          setAvatarPreview(null); 
          if (avatarInputRef.current) avatarInputRef.current.value = ''; 
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  )}
</AnimatePresence>
```


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
```

### Success Toast Animation
```tsx
<AnimatePresence>
  {(successMessage || (showFlash && flash?.success)) && (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className="fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
    >
      <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
      </div>
      <div>
        <p className="font-bold">Berhasil!</p>
        <p className="text-xs opacity-80">{successMessage || flash?.success}</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Hover & Interaction States
- Avatar: scale 1.02 on hover, camera overlay
- Stats cards: scale 1.05, translate-y -5
- Tab buttons: scale 1.01 on hover, 0.98 on tap
- Form buttons: scale 1.03 on hover, 0.97 on tap
- Badge items: scale 1.1, rotate 5deg on hover
- Info rows: background change on hover

## 📱 RESPONSIVE DESIGN (CRITICAL)

### Mobile (< 640px)
```tsx
// Banner height:
h-44 (mobile) vs h-56 (desktop)

// Avatar size:
h-28 w-28 (mobile) vs h-36 w-36 (desktop)

// Stats grid:
grid-cols-3 (always 3 columns, compact)
gap-4 (smaller gap)
p-3 (smaller padding)

// Tab navigation:
- Hide text labels on mobile (only icons)
- span className="hidden sm:inline"

// Form layout:
- grid-cols-1 (mobile)
- grid-cols-2 (md and up)

// Padding adjustments:
- p-4 md:p-6 (general padding)
- px-6 md:px-8 (horizontal padding)
```

### Tablet (640px - 1024px)
```tsx
// Overview grid:
grid-cols-1 lg:grid-cols-2

// Show tab labels:
sm:inline

// Moderate spacing:
gap-5 (between cards)
```

### Desktop (> 1024px)
```tsx
// Full layout:
max-w-7xl mx-auto

// Two-column layout:
lg:grid-cols-2

// Optimal spacing:
gap-6
p-6
```

### Touch Interactions
- Larger tap targets (min 44x44px)
- Proper spacing between interactive elements
- No hover-only features on mobile
- Touch-friendly form inputs

## 🎨 COLOR PALETTE

### Primary Gradients
```css
/* Hero Banner */
from-violet-600 via-purple-500 to-fuchsia-500

/* Buttons & Active States */
from-violet-600 to-purple-600

/* Success States */
from-emerald-500 to-teal-600

/* Warning/Security */
from-red-500 to-rose-600

/* Info */
from-blue-500 to-indigo-600

/* Stats */
from-emerald-400 to-teal-600 (attendance)
from-blue-400 to-indigo-600 (percentage)
from-amber-400 to-orange-600 (streak)
```

### Glassmorphism
```css
/* Card backgrounds */
bg-white/40 dark:bg-neutral-900/40
backdrop-blur-xl
border border-white/20 dark:border-white/5
shadow-xl

/* Overlay elements */
bg-white/10 backdrop-blur
```

### Status Colors
```css
/* Active/Success */
bg-emerald-50 dark:bg-emerald-900/20
text-emerald-600 dark:text-emerald-400

/* Warning */
bg-amber-50 dark:bg-amber-900/20
text-amber-600 dark:text-amber-400

/* Error */
bg-red-50 dark:bg-red-900/20
text-red-600 dark:text-red-400

/* Info */
bg-blue-50 dark:bg-blue-900/20
text-blue-600 dark:text-blue-400
```

## 🔧 FEATURES & FUNCTIONALITY

### 1. Avatar Upload
```tsx
// File input (hidden)
<input 
  ref={avatarInputRef} 
  type="file" 
  accept="image/*" 
  className="hidden" 
  onChange={handleAvatarChange} 
/>

// Preview before upload
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('File terlalu besar. Maksimal 2MB');
    return;
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('File harus berupa gambar');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => setAvatarPreview(e.target?.result as string);
  reader.readAsDataURL(file);
};

// Upload to server
const handleAvatarUpload = () => {
  const file = avatarInputRef.current?.files?.[0];
  if (!file) return;
  
  setIsUploadingAvatar(true);
  const formData = new FormData();
  formData.append('avatar', file);
  
  router.post('/user/profile/avatar', formData, {
    forceFormData: true,
    onSuccess: () => {
      setSuccessMessage('Foto profil berhasil diperbarui!');
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (errors) => {
      toast.error(errors.avatar || 'Gagal mengupload foto');
    },
    onFinish: () => setIsUploadingAvatar(false),
  });
};
```

### 2. Profile Update
```tsx
const handleProfileSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  profileForm.patch('/user/profile', {
    onSuccess: () => {
      setSuccessMessage('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (errors) => {
      // Errors will be shown via InputError components
      console.error('Profile update failed:', errors);
    },
  });
};
```

### 3. Password Change
```tsx
const handlePasswordSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate passwords match
  if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
    passwordForm.setError('password_confirmation', 'Password tidak cocok');
    return;
  }
  
  // Validate password strength
  if (passwordForm.data.password.length < 8) {
    passwordForm.setError('password', 'Password minimal 8 karakter');
    return;
  }
  
  passwordForm.patch('/user/password', {
    onSuccess: () => {
      passwordForm.reset('current_password', 'password', 'password_confirmation');
      setSuccessMessage('Password berhasil diubah!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (errors) => {
      // Errors will be shown via InputError components
      if (errors.current_password) {
        toast.error('Password saat ini salah');
      }
    },
  });
};
```

### 4. Password Strength Indicator
```tsx
const getPasswordStrength = (password: string) => {
  if (password.length < 8) return { label: 'Lemah', color: 'text-red-500', value: 33 };
  if (password.length < 12) return { label: 'Sedang', color: 'text-amber-500', value: 66 };
  return { label: 'Kuat', color: 'text-emerald-500', value: 100 };
};

// Usage in component
{passwordForm.data.password && (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-neutral-500">Kekuatan Password:</span>
      <span className={cn("font-semibold", getPasswordStrength(passwordForm.data.password).color)}>
        {getPasswordStrength(passwordForm.data.password).label}
      </span>
    </div>
    <Progress value={getPasswordStrength(passwordForm.data.password).value} className="h-2" />
  </div>
)}
```

### 5. Badge Display
```tsx
const BadgeImageProfile = ({ icon, name }: { icon: string; name: string }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !icon) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
        <Award className="h-5 w-5 text-white" />
      </div>
    );
  }

  return (
    <img
      src={`/images/badges/${icon}`}
      alt={name}
      className="h-full w-full object-contain"
      onError={() => setImageError(true)}
    />
  );
};
```

### 6. Tab State Management
```tsx
type TabType = 'overview' | 'card' | 'edit' | 'security';
const [activeTab, setActiveTab] = useState<TabType>('overview');

// Persist tab state in URL (optional)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') as TabType;
  if (tab && ['overview', 'card', 'edit', 'security'].includes(tab)) {
    setActiveTab(tab);
  }
}, []);

// Update URL when tab changes
const handleTabChange = (tab: TabType) => {
  setActiveTab(tab);
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  window.history.pushState({}, '', url);
};
```

## 🚀 INOVASI & FITUR TAMBAHAN

### 1. Profile Completion Progress
```tsx
const calculateProfileCompletion = () => {
  let completed = 0;
  let total = 5;
  
  if (mahasiswa.nama) completed++;
  if (mahasiswa.email) completed++;
  if (mahasiswa.phone) completed++;
  if (mahasiswa.avatar_url) completed++;
  if (mahasiswa.bio) completed++;
  
  return Math.round((completed / total) * 100);
};

// Display in overview tab
<div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium">Kelengkapan Profil</span>
    <span className="text-sm font-bold">{calculateProfileCompletion()}%</span>
  </div>
  <Progress value={calculateProfileCompletion()} className="h-2" />
  {calculateProfileCompletion() < 100 && (
    <p className="text-xs text-neutral-500 mt-2">
      Lengkapi profil Anda untuk pengalaman yang lebih baik
    </p>
  )}
</div>
```

### 2. Recent Activity Log
```tsx
<div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
  <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
      <Activity className="h-4 w-4 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
        Aktivitas Terkini
      </h3>
      <p className="text-[11px] text-neutral-500">7 hari terakhir</p>
    </div>
  </div>
  
  <div className="p-5 space-y-3">
    {recentActivities.map((activity, i) => (
      <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
        <div className={`p-2 rounded-lg ${activity.bgColor}`}>
          <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {activity.title}
          </p>
          <p className="text-xs text-neutral-500">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

### 3. QR Code for Profile Sharing
```tsx
import QRCode from 'qrcode.react';

<div className="flex flex-col items-center p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900">
  <QRCode 
    value={`${window.location.origin}/profile/${mahasiswa.nim}`}
    size={200}
    level="H"
    includeMargin={true}
  />
  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 text-center">
    Scan QR Code untuk melihat profil publik
  </p>
  <Button 
    size="sm" 
    variant="outline" 
    className="mt-3"
    onClick={() => {
      // Download QR Code
      const canvas = document.querySelector('canvas');
      const url = canvas?.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-profile-${mahasiswa.nim}.png`;
      link.href = url || '';
      link.click();
    }}
  >
    <Download className="h-3.5 w-3.5 mr-1.5" />
    Download QR Code
  </Button>
</div>
```

### 4. Export Profile Data
```tsx
const exportProfileData = () => {
  const data = {
    nama: mahasiswa.nama,
    nim: mahasiswa.nim,
    email: mahasiswa.email,
    phone: mahasiswa.phone,
    stats: stats,
    badges: badges.filter(b => b.unlocked),
    exportedAt: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `profile-${mahasiswa.nim}-${Date.now()}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  
  toast.success('Data profil berhasil diexport');
};

// Button in settings
<Button 
  variant="outline" 
  size="sm"
  onClick={exportProfileData}
>
  <Download className="h-4 w-4 mr-2" />
  Export Data Profil
</Button>
```

### 5. Theme Preference (Optional)
```tsx
const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

<div className="space-y-3">
  <h4 className="font-semibold text-sm">Tema Tampilan</h4>
  <div className="grid grid-cols-3 gap-2">
    {['light', 'dark', 'system'].map((t) => (
      <button
        key={t}
        onClick={() => setTheme(t as any)}
        className={cn(
          "p-3 rounded-xl border-2 transition-all",
          theme === t
            ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
        )}
      >
        <div className="text-center">
          {t === 'light' && <Sun className="h-5 w-5 mx-auto mb-1" />}
          {t === 'dark' && <Moon className="h-5 w-5 mx-auto mb-1" />}
          {t === 'system' && <Monitor className="h-5 w-5 mx-auto mb-1" />}
          <p className="text-xs font-medium capitalize">{t}</p>
        </div>
      </button>
    ))}
  </div>
</div>
```


## 🧪 TESTING CHECKLIST

### Functional Testing
- [ ] Avatar upload berfungsi (max 2MB, image only)
- [ ] Avatar preview sebelum upload
- [ ] Profile update saves correctly
- [ ] Password change dengan validasi
- [ ] Password strength indicator accurate
- [ ] Form validation bekerja
- [ ] Tab navigation smooth
- [ ] Badge display correct
- [ ] Stats calculation accurate
- [ ] Success toast muncul dan hilang otomatis

### UI/UX Testing
- [ ] Semua animasi smooth (60fps)
- [ ] Hover states konsisten
- [ ] Loading states ditampilkan
- [ ] Error states handled dengan baik
- [ ] Empty states informatif
- [ ] Toast notifications muncul
- [ ] Tab transitions smooth
- [ ] Form inputs accessible

### Responsive Testing
- [ ] Mobile (320px - 640px) ✓
- [ ] Tablet (640px - 1024px) ✓
- [ ] Desktop (1024px+) ✓
- [ ] Avatar size responsive
- [ ] Stats grid responsive
- [ ] Form layout responsive
- [ ] Tab labels hide on mobile
- [ ] Touch interactions smooth

### Security Testing
- [ ] Password tidak terlihat default
- [ ] Toggle password visibility works
- [ ] Current password required untuk change
- [ ] Password confirmation match
- [ ] Minimum password length enforced
- [ ] XSS prevention in inputs
- [ ] CSRF token included

### Performance Testing
- [ ] Initial load < 2s
- [ ] Tab switch < 100ms
- [ ] Form submit < 500ms
- [ ] Avatar upload < 3s
- [ ] No layout shifts
- [ ] Images optimized
- [ ] Smooth animations

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text untuk images
- [ ] Form labels proper

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
  }
}
```

### Shadcn UI Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
```

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Hero Profile Card (Priority: HIGH)
1. ✅ Implement animated gradient banner
2. ✅ Create avatar section with glow effect
3. ✅ Add verified badge animation
4. ✅ Build profile info section
5. ✅ Add action buttons

### Phase 2: Stats & Badges (Priority: HIGH)
1. ✅ Create quick stats grid
2. ✅ Implement badges section
3. ✅ Add badge tooltips
4. ✅ Link to achievements page
5. ✅ Add animations

### Phase 3: Tab Navigation (Priority: HIGH)
1. ✅ Build tab navigation component
2. ✅ Implement tab state management
3. ✅ Add tab animations
4. ✅ Create tab content structure
5. ✅ Add AnimatePresence

### Phase 4: Overview Tab (Priority: MEDIUM)
1. ✅ Personal information card
2. ✅ Academic stats card
3. ✅ Account status card
4. ✅ Recent activity (optional)
5. ✅ Profile completion progress

### Phase 5: Card Tab (Priority: MEDIUM)
1. ✅ Integrate ProfileCard component
2. ✅ Add 3D tilt effect
3. ✅ Customize colors
4. ✅ Add description text
5. ✅ Link to edit tab

### Phase 6: Edit Tab (Priority: HIGH)
1. ✅ Avatar upload section
2. ✅ Profile form fields
3. ✅ Form validation
4. ✅ Submit handler
5. ✅ Success feedback

### Phase 7: Security Tab (Priority: HIGH)
1. ✅ Password change form
2. ✅ Password visibility toggles
3. ✅ Password strength indicator
4. ✅ Security tips section
5. ✅ Submit handler

### Phase 8: Polish & Optimization (Priority: MEDIUM)
1. ✅ Optimize animations
2. ✅ Add loading states
3. ✅ Implement error handling
4. ✅ Add success toasts
5. ✅ Performance optimization

### Phase 9: Testing & QA (Priority: HIGH)
1. ✅ Functional testing
2. ✅ Responsive testing
3. ✅ Browser compatibility
4. ✅ Accessibility audit
5. ✅ Performance audit

## 📝 FINAL CHECKLIST

### Design Consistency ✓
- [x] Hero banner matching dosen profile
- [x] Avatar with glow effect
- [x] Stats cards glassmorphism
- [x] Tab navigation matching
- [x] Form design consistent
- [x] Color scheme matching
- [x] Typography konsisten
- [x] Spacing & padding uniform

### Content Quality ✓
- [x] All labels in Bahasa Indonesia
- [x] Helpful placeholder text
- [x] Clear error messages
- [x] Informative tooltips
- [x] Security tips included
- [x] No typo or grammar error
- [x] Consistent tone of voice

### Functionality ✓
- [x] Avatar upload works
- [x] Profile update works
- [x] Password change works
- [x] Form validation proper
- [x] Tab navigation smooth
- [x] Badge display correct
- [x] Stats calculation accurate
- [x] Success feedback clear

### Responsive Design ✓
- [x] Mobile optimized
- [x] Tablet optimized
- [x] Desktop optimized
- [x] Touch interactions smooth
- [x] Text readable di semua ukuran
- [x] Images responsive
- [x] Navigation accessible

### Performance ✓
- [x] Fast initial load
- [x] Smooth animations (60fps)
- [x] Optimized images
- [x] Efficient re-renders
- [x] No memory leaks
- [x] Code splitting
- [x] Lazy loading

### Accessibility ✓
- [x] Keyboard navigation
- [x] Screen reader support
- [x] ARIA labels
- [x] Color contrast WCAG AA
- [x] Focus indicators
- [x] Alt text untuk images
- [x] Semantic HTML

## 🎯 SUCCESS CRITERIA

### Must Have (P0)
1. ✅ Hero profile card dengan animated gradient
2. ✅ Avatar upload dengan preview
3. ✅ Quick stats grid (3 stats)
4. ✅ Badges section dengan link ke achievements
5. ✅ Tab navigation (4 tabs)
6. ✅ Overview tab dengan info cards
7. ✅ Card tab dengan 3D profile card
8. ✅ Edit tab dengan form lengkap
9. ✅ Security tab dengan password change
10. ✅ Responsive di semua device

### Should Have (P1)
1. ✅ Password strength indicator
2. ✅ Avatar hover effects
3. ✅ Badge tooltips
4. ✅ Success toast animations
5. ✅ Form validation messages
6. ✅ Loading states
7. ✅ Error handling
8. ✅ Security tips
9. ✅ Profile completion progress
10. ✅ Recent activity log

### Nice to Have (P2)
1. ✅ QR Code for profile sharing
2. ✅ Export profile data
3. ✅ Theme preference
4. ✅ Tab state in URL
5. ✅ Keyboard shortcuts
6. ✅ Advanced animations
7. ✅ Profile analytics
8. ✅ Social links
9. ✅ Bio/About section
10. ✅ Custom avatar frames

## 🔥 CRITICAL REQUIREMENTS (TIDAK BOLEH DILANGGAR)

### 1. NO DUMMY DATA
❌ **DILARANG KERAS:**
- Menggunakan data dummy/placeholder
- Fake statistics
- Random numbers
- Lorem ipsum text

✅ **WAJIB:**
- Semua data real dari database
- Statistics yang akurat
- Real user information
- Proper fallbacks untuk data kosong

### 2. ICON CONSISTENCY
❌ **HAPUS:**
- Container/background di belakang icon header
- Animasi icon yang bergerak naik-turun
- Icon yang tidak matching dengan tema

✅ **GUNAKAN:**
- Icon PNG dari assets (profileIcon)
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

### 4. SECURITY
❌ **JANGAN:**
- Store password in plain text
- Show password by default
- Skip validation
- Allow weak passwords
- Expose sensitive data

✅ **LAKUKAN:**
- Hash passwords server-side
- Hide password by default
- Validate all inputs
- Enforce password strength
- Sanitize user inputs

### 5. PERFORMANCE
❌ **HINDARI:**
- Animasi yang lag
- Too many re-renders
- Heavy images
- Blocking operations
- Memory leaks

✅ **GUNAKAN:**
- GPU-accelerated animations
- Memoization where needed
- Optimized images
- Async operations
- Proper cleanup

## 💡 TIPS & BEST PRACTICES

### Development Tips
1. **Component Reusability**: Extract reusable components
2. **Type Safety**: Use TypeScript dengan proper types
3. **Error Boundaries**: Implement error boundaries
4. **Loading States**: Always show loading state
5. **Validation**: Client-side + server-side validation

### UX Tips
1. **Clear Feedback**: Always provide feedback for actions
2. **Error Messages**: Clear and actionable
3. **Loading Indicators**: Show progress
4. **Success Confirmation**: Visual confirmation
5. **Undo Actions**: Allow undo where possible

### Security Tips
1. **Input Validation**: Validate all user inputs
2. **XSS Prevention**: Sanitize HTML content
3. **CSRF Protection**: Include CSRF tokens
4. **Password Strength**: Enforce strong passwords
5. **Rate Limiting**: Prevent brute force attacks

### Performance Tips
1. **Lazy Loading**: Load images lazily
2. **Code Splitting**: Split by route
3. **Memoization**: Use useMemo/useCallback
4. **Debouncing**: Debounce expensive operations
5. **Caching**: Cache API responses

### Accessibility Tips
1. **Semantic HTML**: Use proper HTML tags
2. **ARIA Labels**: Add ARIA labels
3. **Keyboard Navigation**: Support keyboard
4. **Color Contrast**: Ensure good contrast
5. **Focus Indicators**: Visible focus states

## 🏁 CONCLUSION

Menu Profile Mahasiswa adalah menu yang sangat krusial karena:

1. **Identitas User**: Representasi diri mahasiswa di sistem
2. **Keamanan Akun**: Manajemen password dan keamanan
3. **Personalisasi**: Customization dan preferensi
4. **Trust Building**: Profil lengkap = kredibilitas tinggi
5. **User Engagement**: Badges dan achievements motivasi

**Target Akhir:**
- User merasa profil mereka aman dan terlindungi
- User mudah update informasi personal
- User bangga dengan achievements mereka
- User experience yang menyenangkan dan smooth
- Design yang modern dan professional

**Metrics Success:**
- Profile completion rate > 80%
- Avatar upload success rate > 95%
- Password change success rate > 90%
- User satisfaction score > 4.5/5
- Return visit rate > 70%

---

## 🚀 READY TO IMPLEMENT!

Dengan prompt ini, developer harus bisa:
1. ✅ Memahami requirement dengan sangat jelas
2. ✅ Implement dengan standar ultra-advanced
3. ✅ Deliver hasil yang matching dengan dosen profile
4. ✅ Create profile page yang truly professional
5. ✅ Maintain consistency dengan menu lain

**Good luck and happy coding! 🎉**

