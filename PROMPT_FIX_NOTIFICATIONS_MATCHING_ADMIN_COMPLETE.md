# 🎯 PROMPT: FIX NOTIFICATIONS (NOTIFIKASI MAHASISWA) - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Notifications (Notifikasi Mahasiswa)** dengan sangat serius dan teliti. Menu ini sangat krusial karena menampilkan pemberitahuan dan pengumuman penting untuk mahasiswa.

### File yang Akan Diupdate:
- **`resources/js/pages/user/notifications.tsx`** - Halaman notifikasi mahasiswa

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Hilangkan Container di Icon Header** - Icon langsung dengan drop-shadow
3. **Hilangkan SEMUA Animasi Floating Particles** - Tidak ada particles bergerak
4. **Responsive Mobile** - UI/UX mobile matching admin dashboard
5. **Tombol Kembali** - Matching dengan menu lain (simple button)
6. **No Dummy Data** - Semua data real dari backend
7. **Icon Colors** - Sesuaikan warna icon dengan warna container
8. **Stats Cards - HANYA 4 CARDS** - Kurangi dari 6 menjadi 4 cards saja
9. **Glassmorphism Containers** - Semua card menggunakan glassmorphism

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

## 🔧 PERBAIKAN KRUSIAL - NOTIFICATIONS.TSX

### 1️⃣ HEADER SECTION - PERLU UPDATE

**BEFORE (Current - PERLU DIUBAH):**
```typescript
// ❌ Icon dengan container background
<motion.div
  className="relative flex h-16 w-16 items-center justify-center"
>
  <img src={NotificationIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
</motion.div>

// ❌ Tidak ada tombol kembali
// ❌ Gradient background sudah benar tapi perlu tambahan blur orbs
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Header matching dashboard dengan tombol kembali
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
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

  <div className="relative">
    {/* Tombol Kembali */}
    <motion.button
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.visit('/user/dashboard')}
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
            src={NotificationIcon} 
            alt="Notifikasi" 
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
          />
        </motion.div>
        
        <div className="flex-1 mt-1 sm:mt-0">
          <motion.p
            className="text-sm text-indigo-100 font-medium tracking-wide"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Pusat Pemberitahuan
          </motion.p>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-white mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Notifikasi
          </motion.h1>
          <motion.p
            className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Pemberitahuan dan pengumuman terbaru untuk Anda
          </motion.p>
        </div>
      </div>

      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10 text-white font-semibold transition-all hover:bg-white/30"
        >
          <CheckCircle className="h-5 w-5" />
          Tandai Semua Dibaca
        </motion.button>
      )}
    </div>
  </div>
</motion.div>
```

### 2️⃣ FILTER SECTION - PERLU UPDATE

**BEFORE (Current - PERLU DIUBAH):**
```typescript
// ❌ Menggunakan bg-white dan border-slate-200
<motion.div
  className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50"
>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Glassmorphism matching dashboard
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  whileHover={{ scale: 1.01, y: -2 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
  <div className="flex items-center gap-3 mb-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
      <Filter className="h-5 w-5" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
        Filter Notifikasi
      </h2>
      <p className="text-sm text-neutral-500">
        Saring notifikasi berdasarkan kategori
      </p>
    </div>
  </div>
  {/* Filter inputs */}
</motion.div>
```

### 3️⃣ STATS CARDS - CRITICAL: KURANGI MENJADI 4 CARDS SAJA

**BEFORE (Current - SALAH):**
```typescript
// ❌ Ada 6 stats cards (2 rows dengan 3 cards each)
// Row 1: Total, Belum Dibaca, Sudah Dibaca
// Row 2: Hari Ini, Minggu Ini, Urgent

// ❌ Menggunakan bg-white dan border-slate-200
<motion.div
  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 cursor-pointer"
>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ HANYA 4 STATS CARDS dalam 1 row
// Cards: Total, Belum Dibaca, Sudah Dibaca, Urgent

<div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
  {[
    { 
      icon: Bell, 
      label: 'Total Notifikasi', 
      value: stats.total, 
      color: 'from-indigo-400 to-purple-600', 
      delay: 0.1 
    },
    { 
      icon: EyeOff, 
      label: 'Belum Dibaca', 
      value: stats.unread, 
      color: 'from-rose-400 to-pink-600', 
      delay: 0.15 
    },
    { 
      icon: Eye, 
      label: 'Sudah Dibaca', 
      value: stats.read, 
      color: 'from-emerald-400 to-teal-600', 
      delay: 0.2 
    },
    { 
      icon: AlertTriangle, 
      label: 'Urgent', 
      value: stats.urgent, 
      color: 'from-amber-400 to-orange-600', 
      delay: 0.25 
    },
  ].map((stat, index) => {
    const cardKey = `stat-${index}`;
    return (
      <motion.div
        key={stat.label}
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5"
        variants={{
          hidden: { opacity: 0, y: 30, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
        }}
        whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
        onHoverStart={() => setHoveredCard(cardKey)}
        onHoverEnd={() => setHoveredCard(null)}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace('from-', 'from-').replace('to-', 'to-')}/5`} />
        <motion.div
          initial={false}
          animate={{
            scale: hoveredCard === cardKey ? 1.5 : 1,
            opacity: hoveredCard === cardKey ? 0.4 : 0.2,
          }}
          transition={{ duration: 0.5 }}
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} blur-3xl transition-all duration-500`}
        />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`} />
            <stat.icon className="relative h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
            <div className="mt-0.5 sm:mt-1">
              <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                <AnimatedCounter value={stat.value} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  })}
</div>
```

### 4️⃣ NOTIFICATIONS LIST - PERLU UPDATE

**BEFORE (Current - PERLU DIUBAH):**
```typescript
// ❌ Menggunakan bg-white dan border-slate-200
<motion.div
  className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden"
>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Glassmorphism matching dashboard
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
  <div className="p-6 border-b border-white/10">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
        <Bell className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Daftar Notifikasi
        </h2>
        <p className="text-sm text-neutral-500">
          {notifications.data.length} notifikasi
        </p>
      </div>
    </div>
  </div>
  {/* Notification items */}
</motion.div>
```

### 5️⃣ NOTIFICATION ITEMS - SUDAH BAGUS (MINOR UPDATE)

**Current implementation sudah bagus, hanya perlu update:**
- Background untuk unread: gunakan glassmorphism subtle
- Hover effect: matching dashboard

```typescript
<motion.div
  className={cn(
    "group relative overflow-hidden",
    !notif.read_at && "bg-indigo-50/30 dark:bg-indigo-900/10"
  )}
>
  {/* Content sudah bagus, pertahankan */}
</motion.div>
```

### 6️⃣ DETAIL MODAL - PERLU UPDATE

**BEFORE (Current - PERLU DIUBAH):**
```typescript
// ❌ Menggunakan bg-white dan border-slate-200
<motion.div
  className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-2xl border border-slate-200 dark:border-slate-800/50"
>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Glassmorphism matching dashboard
<motion.div
  initial={{ scale: 0.9, y: 20 }}
  animate={{ scale: 1, y: 0 }}
  exit={{ scale: 0.9, y: 20 }}
  onClick={(e) => e.stopPropagation()}
  className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl p-6 shadow-2xl dark:border-white/5 max-h-[90vh] overflow-y-auto"
>
  {/* Content */}
</motion.div>
```

---

## 📱 RESPONSIVE MOBILE - MATCHING DASHBOARD

### Header Mobile Layout
```typescript
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
  <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24">
    <img src={NotificationIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
  </motion.div>
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide">
      Pusat Pemberitahuan
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      Notifikasi
    </motion.h1>
  </div>
</div>
```

### Stats Cards Responsive
```typescript
// Grid: 2 columns on mobile, 4 columns on desktop
<div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
  {/* 4 stats cards */}
</div>
```

### Filter Section Responsive
```typescript
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Filter inputs */}
</div>
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### ✅ Header Section
- [ ] Add tombol kembali di dalam header gradient
- [ ] Update icon header (NO container, only drop-shadow)
- [ ] Add blur orbs di background
- [ ] Responsive mobile (flex-col sm:flex-row)
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl

### ✅ Filter Section
- [ ] Update ke glassmorphism (bg-white/40 dark:bg-neutral-900/40)
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Section header dengan icon gradient
- [ ] Rounded-3xl

### ✅ Stats Cards - CRITICAL
- [ ] **KURANGI dari 6 menjadi 4 cards**
- [ ] Cards: Total, Belum Dibaca, Sudah Dibaca, Urgent
- [ ] **HAPUS cards: Hari Ini, Minggu Ini**
- [ ] Update ke glassmorphism
- [ ] Grid: grid-cols-2 lg:grid-cols-4
- [ ] Hover animation matching dashboard
- [ ] Add hoveredCard state

### ✅ Notifications List
- [ ] Update container ke glassmorphism
- [ ] Section header dengan icon gradient
- [ ] Update notification items background (subtle)
- [ ] Rounded-3xl

### ✅ Detail Modal
- [ ] Update ke glassmorphism
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Rounded-3xl

### ✅ Mobile Responsive
- [ ] Header: flex-col sm:flex-row
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl
- [ ] Stats: grid-cols-2 lg:grid-cols-4
- [ ] Filter: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- [ ] Padding: p-4 md:p-6 lg:p-8

---

## 💎 CRITICAL CHANGES SUMMARY

### MUST DO (CRITICAL):
1. 🚨 **KURANGI Stats Cards dari 6 menjadi 4**
   - Hapus: "Hari Ini" dan "Minggu Ini"
   - Pertahankan: Total, Belum Dibaca, Sudah Dibaca, Urgent
   - Grid: grid-cols-2 lg:grid-cols-4

2. ⚠️ **Add Tombol Kembali** di dalam header gradient

3. ⚠️ **Update Icon Header** - NO container, only drop-shadow

4. ⚠️ **Update Semua Containers** ke glassmorphism

5. ⚠️ **Add Section Headers** dengan icon gradient

### SHOULD DO (HIGH PRIORITY):
1. Add blur orbs di header background
2. Update filter section ke glassmorphism
3. Update notifications list container ke glassmorphism
4. Update detail modal ke glassmorphism
5. Ensure responsive mobile perfect

### NICE TO HAVE (MEDIUM PRIORITY):
1. Add hoveredCard state untuk stats cards
2. Update notification items background (subtle)
3. Smooth animations matching dashboard

---

## 🎨 GLASSMORPHISM PATTERN (WAJIB DIGUNAKAN)

```typescript
// Standard Glassmorphism Container
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  whileHover={{ scale: 1.01, y: -2 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
  {/* Content */}
</motion.div>

// Section Header with Icon Gradient
<div className="flex items-center gap-3 mb-4">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
    <Icon className="h-5 w-5" />
  </div>
  <div>
    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
      Section Title
    </h2>
    <p className="text-sm text-neutral-500">
      Section description
    </p>
  </div>
</div>

// Stats Card with Hover Effect
<motion.div
  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
  whileHover={{ scale: 1.04, y: -4 }}
>
  <div className={`absolute inset-0 bg-gradient-to-br ${color}/5`} />
  <motion.div
    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${color} blur-3xl`}
  />
  {/* Content */}
</motion.div>
```

---

## 📝 NOTES PENTING

### ❌ YANG HARUS DIHAPUS:
1. **Stats Cards "Hari Ini" dan "Minggu Ini"** - Kurangi menjadi 4 cards saja
2. **bg-white dan bg-slate-50** - Ganti dengan glassmorphism
3. **border-slate-200** - Ganti dengan border-white/20
4. **dark:bg-gradient-to-br dark:from-slate-900 dark:to-black** - Ganti dengan dark:bg-neutral-900/40
5. **rounded-2xl** - Ganti dengan rounded-3xl untuk main containers

### ✅ YANG HARUS DITAMBAHKAN:
1. Tombol kembali di dalam header gradient
2. Blur orbs di header background
3. Glassmorphism di semua containers
4. Section headers dengan icon gradient
5. Hover animations matching dashboard
6. HoveredCard state untuk stats cards
7. AnimatedCounter untuk stats values

### ✅ YANG SUDAH BENAR (PERTAHANKAN):
1. Gradient header animated
2. Notification items structure
3. Detail modal structure
4. Filter functionality
5. Pagination
6. Delete confirmation dialog
7. Mark as read functionality

---

## 🎯 PRIORITY ORDER

### CRITICAL (HARUS DIKERJAKAN PERTAMA):
1. **KURANGI Stats Cards dari 6 menjadi 4**
2. Add tombol kembali di header
3. Update icon header (NO container)
4. Update semua containers ke glassmorphism

### HIGH PRIORITY:
1. Add blur orbs di header
2. Add section headers dengan icon gradient
3. Update filter section ke glassmorphism
4. Update notifications list ke glassmorphism
5. Update detail modal ke glassmorphism

### MEDIUM PRIORITY:
1. Add hoveredCard state
2. Update notification items background
3. Ensure responsive mobile perfect
4. Add AnimatedCounter

---

## ✨ FINAL RESULT

Setelah implementasi, menu Notifications akan:
- ✅ 100% matching dengan dashboard admin
- ✅ HANYA 4 stats cards (bukan 6)
- ✅ Glassmorphism effect di semua container
- ✅ Icon header dengan drop-shadow (NO container)
- ✅ Gradient background animated di header
- ✅ Tombol kembali di dalam header
- ✅ Responsive mobile perfect
- ✅ No dummy data
- ✅ Smooth animations matching dashboard
- ✅ Section headers dengan icon gradient
- ✅ Clean dan professional look

---

## 🔍 VERIFICATION CHECKLIST

Setelah implementasi, pastikan:
- [ ] Stats cards HANYA 4 (Total, Belum Dibaca, Sudah Dibaca, Urgent)
- [ ] Tombol kembali ada di dalam header gradient
- [ ] Icon header NO container, only drop-shadow
- [ ] Semua containers menggunakan glassmorphism
- [ ] Section headers menggunakan icon gradient
- [ ] Hover animations matching dashboard
- [ ] Responsive mobile perfect (grid-cols-2 lg:grid-cols-4)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Animations smooth dan tidak lag
- [ ] Dark mode works perfectly
- [ ] Filter functionality works
- [ ] Mark as read works
- [ ] Delete works
- [ ] Detail modal works
