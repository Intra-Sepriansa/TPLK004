# Implementation Tasks: Rekapan UI Enhancement

## Phase 1: Setup & Imports

- [ ] Backup current `resources/js/pages/user/rekapan.tsx`
- [ ] Import PNG icons dari folder admin
- [ ] Verify all PNG assets exist
- [ ] Update import statements

## Phase 2: Animation Variants

- [ ] Update `containerVariants` (staggerChildren: 0.04)
- [ ] Update `itemVariants` (stiffness: 300, damping: 20, y: 30)
- [ ] Update `cardHoverVariants` (scale: 1.04, y: -4)
- [ ] Remove `rotateX` and `mass` from variants

## Phase 3: Header Section

- [ ] Update gradient background (from-indigo-600 via-purple-600 to-pink-500)
- [ ] Add animated background position
- [ ] Add overlay & glow orbs
- [ ] Replace 25 particles with 2 floating icons
- [ ] Update pulsating rings (3 rings)
- [ ] Update header icon to PNG with drop-shadow
- [ ] Update text colors to indigo-100
- [ ] Update mini stats cards with shimmer effect

## Phase 4: Stats Cards

- [ ] Create new StatCard component with PNG icons
- [ ] Add gradient background layers
- [ ] Add animated glow effect
- [ ] Update hover animations
- [ ] Add icon hover effects (scale: 1.1, rotate: 10)
- [ ] Update text colors to neutral palette
- [ ] Add drop-shadow to PNG icons
- [ ] Update responsive sizing

## Phase 5: Container Updates

- [ ] Update ALL containers to bg-white/40 dark:bg-neutral-900/40
- [ ] Add backdrop-blur-xl to ALL containers
- [ ] Update borders to border-white/20 dark:border-white/5
- [ ] Change rounded-2xl to rounded-3xl
- [ ] Update shadow-sm to shadow-xl
- [ ] Add whileHover to chart containers

## Phase 6: Chart Containers

- [ ] Update course summary container
- [ ] Update bar chart container
- [ ] Update line chart container
- [ ] Update pie chart container
- [ ] Add section headers with animated icons
- [ ] Update border-b colors
- [ ] Update CartesianGrid stroke colors
- [ ] Update XAxis/YAxis tick colors

## Phase 7: Tooltip

- [ ] Update to rounded-xl
- [ ] Add backdrop-blur-xl
- [ ] Update border colors
- [ ] Update background colors
- [ ] Update text colors to neutral palette
- [ ] Update dot size to h-2.5 w-2.5

## Phase 8: Course Summary Items

- [ ] Update hover animation (x: 5, scale: 1.01)
- [ ] Add backgroundColor change on hover
- [ ] Change border-l-2 to border-l-4
- [ ] Add rounded-r-xl
- [ ] Update transition settings
- [ ] Update text colors

## Phase 9: Evaluation Section

- [ ] Wrap EvaluationDashboard in glassmorphism container
- [ ] Wrap WhatIfSimulator in glassmorphism container
- [ ] Add section headers with animated icons
- [ ] Add hover effects
- [ ] Update all borders and backgrounds

## Phase 10: Recent Activity

- [ ] Update container to glassmorphism style
- [ ] Add section header with animated icon
- [ ] Update dividers
- [ ] Add hover effects to log items
- [ ] Update empty state styling
- [ ] Update text colors

## Phase 11: Right Sidebar Widgets

- [ ] Update distribution pie chart container
- [ ] Update attendance rate card
- [ ] Update weekly streak widget
- [ ] Update next achievement widget
- [ ] Update quick links widget
- [ ] Ensure all use glassmorphism style
- [ ] Add hover effects to all widgets

## Phase 12: Testing

- [ ] Test all animations are smooth
- [ ] Test hover effects on all cards
- [ ] Test responsive on mobile (< 640px)
- [ ] Test responsive on tablet (640px - 1024px)
- [ ] Test responsive on desktop (> 1024px)
- [ ] Test dark mode consistency
- [ ] Test all border colors match
- [ ] Test backdrop-blur-xl works
- [ ] Test PNG icons load correctly
- [ ] Test tooltip appears correctly
- [ ] Test chart interactions
- [ ] Test modal animations

## Phase 13: Final Review

- [ ] Compare with admin dashboard visually
- [ ] Check for any remaining inconsistencies
- [ ] Verify all colors match exactly
- [ ] Verify all animations match exactly
- [ ] Test on different browsers
- [ ] Test on different screen sizes
- [ ] Get user approval

---

**Estimated Time**: 4-6 hours  
**Priority**: HIGH  
**Status**: Ready to start
