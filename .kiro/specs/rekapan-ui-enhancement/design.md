# Design Document: Rekapan UI Enhancement
## 100% Matching Admin Dashboard Style

---

## Overview

Mengubah seluruh UI/UX menu Rekapan Mahasiswa agar 100% matching dengan style Admin Dashboard, termasuk:
- Header gradient & animations
- Container colors (glassmorphism)
- Stats cards dengan PNG icons
- Chart containers
- Hover effects & transitions
- Text colors (neutral palette)
- Border colors
- Responsive behavior

---

## Design Goals

1. **Visual Consistency**: Semua warna, gradient, dan styling harus identik dengan admin dashboard
2. **Smooth Animations**: Menggunakan spring animations dengan stiffness: 300, damping: 20
3. **Glassmorphism**: Semua container menggunakan backdrop-blur-xl dan transparency
4. **PNG Icons**: Menggunakan PNG assets dari folder admin, bukan Lucide icons
5. **Responsive**: Mobile-first design dengan breakpoints yang konsisten

---

## Color System

### Primary Gradient (Header)
```
from-indigo-600 via-purple-600 to-pink-500
```

### Container Colors
```
Light: bg-white/40 + backdrop-blur-xl
Dark: bg-neutral-900/40 + backdrop-blur-xl
```

### Border Colors
```
Light: border-white/20
Dark: border-white/5
```

### Text Colors (Neutral Palette)
```
Headings: text-neutral-900 dark:text-white
Subtext: text-neutral-500 dark:text-neutral-400
Muted: text-neutral-400 dark:text-neutral-500
```

---

## Animation System

### Container Variants
```typescript
staggerChildren: 0.04
delayChildren: 0.1
```

### Item Variants
```typescript
y: 30
stiffness: 300
damping: 20
```

### Card Hover
```typescript
scale: 1.04
y: -4
stiffness: 400
damping: 15
```

---

## Component Specifications

### 1. Header Section
- Animated gradient background
- 2 floating icons (FileText, Award)
- 3 pulsating rings
- PNG icon dengan drop-shadow
- Mini stats cards dengan shimmer effect

### 2. Stats Cards
- PNG icons dari admin folders
- Gradient background layers
- Animated glow on hover
- Responsive sizing (h-10 sm:h-14)

### 3. Chart Containers
- Glassmorphism style
- Section headers dengan animated icons
- Backdrop-blur-xl
- Consistent borders

### 4. Course Summary
- Smooth hover dengan backgroundColor change
- Border-l-4 (not border-l-2)
- Rounded-r-xl
- Staggered animations

### 5. Evaluation Section
- Wrapped in glassmorphism containers
- Section headers (Zap, Target icons)
- Hover effects

### 6. Right Sidebar Widgets
- All glassmorphism style
- Consistent borders & backgrounds
- Hover effects
- Animated icons

---

## Responsive Breakpoints

### Mobile (< 640px)
- Stats cards: p-3, h-10 w-10 icons
- Text: text-[10px], text-lg
- Rounded: rounded-2xl
- Grid: grid-cols-2

### Tablet (640px - 1024px)
- Stats cards: p-4, h-12 w-12 icons
- Text: text-xs, text-xl
- Rounded: rounded-2xl sm:rounded-3xl
- Grid: sm:grid-cols-4

### Desktop (> 1024px)
- Stats cards: p-6, h-14 w-14 icons
- Text: text-sm, text-2xl
- Rounded: rounded-3xl
- Grid: lg:grid-cols-3

---

## Assets Required

### PNG Icons
```
@/assets/admin/dashboard/hadir-icon.png
@/assets/admin/dashboard/total-icon.png
@/assets/admin/rekap-kehadiran/terlambat.png
@/assets/admin/rekap-kehadiran/ditolak.png
```

---

## Success Criteria

- [ ] Header gradient matches admin exactly
- [ ] All containers use glassmorphism style
- [ ] Stats cards use PNG icons with drop-shadow
- [ ] Animations are smooth (stiffness: 300, damping: 20)
- [ ] Hover effects work correctly
- [ ] Responsive on all breakpoints
- [ ] Dark mode works perfectly
- [ ] No visual differences from admin dashboard

---

**Status**: Design Complete  
**Next**: Implementation  
**Target File**: `resources/js/pages/user/rekapan.tsx`
