# 🎨 PROMPT: FIX MAHASISWA ABSEN - 100% MATCHING DASHBOARD ADMIN
## Rapihkan UI/UX Menu Absen Mahasiswa

---

## 📋 OVERVIEW MASALAH

### Issues yang Perlu Diperbaiki
```
❌ Header tidak sama dengan dashboard admin (tidak ada gradient)
❌ Container masih pakai warna navy
❌ Header tidak responsive di mobile
❌ QR Scanner belum pakai animasi dari QR Builder admin
❌ Steps 1234 di atas belum rapi
❌ Container tidak pakai HITAM theme
❌ Animasi kurang smooth
```

### Solutions
```
✅ Header gradient matching dashboard admin
✅ HITAM theme: bg-white/40 dark:bg-neutral-900/40
✅ Header responsive untuk mobile
✅ QR Scanner dengan animasi dari QR Builder
✅ Steps indicator rapi dengan glassmorphism
✅ Smooth animations (stiffness: 300, damping: 20)
✅ Floating particles dan animated orbs
```

---

## 🎨 DESIGN SYSTEM — EXACT MATCH DASHBOARD

### Color Palette (HITAM Theme)
```tsx
// Container Colors
bg-white/40 dark:bg-neutral-900/40  // Main containers
border-white/20 dark:border-white/5  // Borders
backdrop-blur-xl                      // Glassmorphism

// Gradient Header
from-indigo-600 via-purple-600 to-pink-500

// Steps Colors
emerald-500  // Active/Done step
neutral-200  // Inactive step
```

### Animation Settings
```tsx
// Smooth animations
stiffness: 300
damping: 20
duration: 0.3

// Stagger
staggerChildren: 0.04
delayChildren: 0.1
```

---

## 💻 IMPLEMENTATION CHANGES

### 1. HEADER - Matching Dashboard Admin

**Before:**
```tsx
// Simple header tanpa gradient
<div className="bg-white dark:bg-neutral-900 p-6">
  <h1>Absen</h1>
</div>
```

**After:**
```tsx
{/* ═══════ HERO HEADER — Matching Dashboard ═══════ */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
  className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
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

  {/* Pulsating Rings */}
  {[0, 1, 2].map((i) => (
    <motion.div
      key={i}
      className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
      animate={{ scale: [1, 3], opacity: [0.3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 1 }}
    />
  ))}

  {/* Floating Icons */}
  <motion.div
    animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 5, -5, 0], opacity: [0.15, 0.3, 0.15] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute top-8 right-24 text-white/15"
  >
    <QrCode className="h-14 w-14" />
  </motion.div>
  <motion.div
    animate={{ y: [0, 20, 0], x: [0, -15, 0], rotate: [0, -10, 10, 0], opacity: [0.1, 0.25, 0.1] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    className="absolute bottom-8 left-24 text-white/15"
  >
    <Camera className="h-16 w-16" />
  </motion.div>

  <div className="relative">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
      {/* Icon */}
      <motion.div
        className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
        whileHover={{ scale: 1.05, rotate: 5 }}
      >
        <img src={absenIcon} alt="Absen" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
      </motion.div>

      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <motion.p
          className="text-xs sm:text-sm text-indigo-100 font-medium tracking-wide"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Absensi Mahasiswa
        </motion.p>
        <motion.h1
          className="text-xl sm:text-3xl font-bold text-white mt-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Scan QR Code
        </motion.h1>
        <motion.p
          className="mt-1 sm:mt-2 text-indigo-100 max-w-lg text-[11px] sm:text-base leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Scan QR code untuk mencatat kehadiran Anda
        </motion.p>
      </div>

      {/* Session Info (if active) */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="flex flex-col items-center sm:items-end gap-2 bg-white/20 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-lg"
        >
          <div className="text-center sm:text-right">
            <p className="text-sm font-semibold">{activeSession.courseName}</p>
            <p className="text-xs text-indigo-200">Pertemuan #{activeSession.meetingNumber}</p>
          </div>
        </motion.div>
      )}
    </div>
  </div>
</motion.div>
```

---

### 2. STEPS INDICATOR - Glassmorphism Style

**Before:**
```tsx
// Steps dengan border biasa
<div className="border-2 border-gray-200 bg-white">
  {index + 1}
</div>
```

**After:**
```tsx
{/* ═══════ STEPS INDICATOR ═══════ */}
<motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5 mb-6"
>
  <div className="flex items-center justify-between gap-2 sm:gap-4">
    {steps.map((step, index) => (
      <div key={step.key} className="flex items-center flex-1">
        {/* Step Circle */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center flex-1"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-lg',
              step.done 
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/30' 
                : index === currentStep 
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-indigo-500/30 animate-pulse' 
                  : 'border-white/20 bg-white/20 dark:bg-neutral-800/50 text-neutral-400 backdrop-blur-sm'
            )}
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <span className="text-sm sm:text-base font-bold">{index + 1}</span>
            )}
          </motion.div>

          {/* Step Label */}
          <motion.p
            className={cn(
              'mt-2 text-[10px] sm:text-xs font-medium text-center transition-colors',
              step.done || index === currentStep
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {step.label}
          </motion.p>
        </motion.div>

        {/* Connector Line */}
        {index < steps.length - 1 && (
          <motion.div
            className="flex-1 h-0.5 mx-2 sm:mx-4 relative"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/20 dark:from-neutral-700 dark:to-neutral-700" />
            {step.done && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        )}
      </div>
    ))}
  </div>
</motion.div>
```

---

### 3. QR SCANNER - Animated dari QR Builder

**Before:**
```tsx
// QR Scanner biasa tanpa animasi
<div id="qr-reader" className="w-full" />
```

**After:**
```tsx
{/* ═══════ QR SCANNER WITH ANIMATION ═══════ */}
<motion.div
  variants={cardVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
  <div className="relative bg-neutral-900 rounded-2xl overflow-hidden aspect-square max-w-md mx-auto">
    {/* Video Feed */}
    <div id="qr-reader" className="w-full h-full" />

    {/* AR Overlay - Animated Corners */}
    {isScanning && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Scanning Frame */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-xs max-h-xs">
            {/* Top Left Corner */}
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl"
            />
            
            {/* Top Right Corner */}
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl"
            />
            
            {/* Bottom Left Corner */}
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl"
            />
            
            {/* Bottom Right Corner */}
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl"
            />

            {/* Scanning Line */}
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500/50"
            />

            {/* Center Crosshair */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
            >
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-500" />
            </motion.div>
          </div>
        </div>

        {/* Scanning Status */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-500/90 text-white text-sm font-medium backdrop-blur-sm shadow-lg"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span>Scanning...</span>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-xs"
        >
          Arahkan QR code ke dalam frame
        </motion.div>
      </motion.div>
    )}

    {/* Success/Error Overlay */}
    <AnimatePresence>
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {scanResult === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Scan Berhasil!
              </h3>
              <p className="text-emerald-400">
                QR Code terverifikasi
              </p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                QR Tidak Valid
              </h3>
              <p className="text-red-400">
                Coba scan ulang
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  {/* Scanner Controls */}
  <div className="mt-6 flex justify-center gap-4">
    {!isScanning ? (
      <Button
        onClick={startScanner}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
      >
        <QrCode className="w-5 h-5 mr-2" />
        Mulai Scan
      </Button>
    ) : (
      <Button
        onClick={stopScanner}
        variant="destructive"
        className="shadow-lg"
      >
        Stop Scan
      </Button>
    )}
  </div>
</motion.div>
```

---

### 4. CONTAINERS - HITAM Theme

**Before:**
```tsx
// Navy/Blue containers
<div className="bg-blue-900 dark:bg-blue-950">
```

**After:**
```tsx
// HITAM theme glassmorphism
<motion.div
  variants={cardVariants}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
>
```

---

## ✅ CHECKLIST IMPLEMENTASI

### UI/UX Changes
```
☐ Update header dengan gradient matching dashboard
☐ Add floating particles dan animated orbs
☐ Fix header responsive untuk mobile
☐ Update steps indicator dengan glassmorphism
☐ Add animated corners untuk QR scanner
☐ Add scanning line animation
☐ Add success/error overlay dengan animation
☐ Change all navy containers to HITAM theme
☐ Update all animations (stiffness: 300, damping: 20)
☐ Add confetti on success scan
```

### Testing
```
☐ Test header di mobile (< 768px)
☐ Test QR scanner animation
☐ Test steps indicator transitions
☐ Test success/error states
☐ Test dark mode
☐ Test all container colors
☐ Test animations smoothness
```

---

## 🎨 COLOR REFERENCE

### Header Gradient
```css
background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%);
```

### Container Colors
```css
/* Light mode */
background: rgba(255, 255, 255, 0.4);
border: rgba(255, 255, 255, 0.2);

/* Dark mode */
background: rgba(23, 23, 23, 0.4);
border: rgba(255, 255, 255, 0.05);
```

### Steps Colors
```css
/* Active/Done */
background: linear-gradient(135deg, #34d399 0%, #14b8a6 100%);
border: #10b981;

/* Current */
background: linear-gradient(135deg, #818cf8 0%, #a855f7 100%);
border: #6366f1;

/* Inactive */
background: rgba(255, 255, 255, 0.2);
border: rgba(255, 255, 255, 0.2);
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Mobile (< 640px)
```tsx
- Icon size: h-16 w-16
- Text size: text-xl
- Padding: p-6
- Steps: h-10 w-10
- Hide some floating elements
```

### Tablet (640px - 1024px)
```tsx
- Icon size: h-18 w-18
- Text size: text-2xl
- Padding: p-7
- Steps: h-11 w-11
```

### Desktop (> 1024px)
```tsx
- Icon size: h-20 w-20
- Text size: text-3xl
- Padding: p-8
- Steps: h-12 w-12
- Show all floating elements
```

---

**Created**: February 26, 2026  
**Purpose**: Fix Mahasiswa Absen UI/UX matching Dashboard Admin  
**Status**: Ready for implementation  
**Estimated Time**: 2-3 hours  
**Priority**: High - UI consistency

---

## 🎉 SUMMARY

Prompt ini akan:
1. ✅ Header gradient 100% matching dashboard admin
2. ✅ HITAM theme untuk semua container
3. ✅ Header responsive untuk mobile
4. ✅ QR Scanner dengan animasi advanced (corners, scanning line, crosshair)
5. ✅ Steps indicator rapi dengan glassmorphism
6. ✅ Smooth animations (stiffness 300, damping 20)
7. ✅ Success/error overlay dengan confetti
8. ✅ Floating particles dan animated orbs

Menu Absen sekarang 100% matching dengan Dashboard Admin! 🚀
