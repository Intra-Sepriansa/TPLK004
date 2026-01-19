# 🎨 Animation & Dark Mode Guide

## 🎬 Framer Motion Animations

### 1. **Container Animations** (Staggered Children)
```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1  // Delay antar children
        }
    }
};

<motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
>
    {/* Children akan muncul satu per satu */}
</motion.div>
```

### 2. **Item Animations** (Spring Effect)
```tsx
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

<motion.div variants={itemVariants}>
    {/* Item dengan spring animation */}
</motion.div>
```

### 3. **Hover Animations**
```tsx
// Scale + Lift
<motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className="..."
>
    {/* Hover untuk scale & lift */}
</motion.div>

// Rotate on Hover
<motion.div
    whileHover={{ rotate: 360 }}
    transition={{ duration: 0.5 }}
>
    {/* Icon rotation */}
</motion.div>
```

### 4. **Tap Animations**
```tsx
<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
>
    {/* Button dengan feedback */}
</motion.button>
```

### 5. **Continuous Animations** (Ambient)
```tsx
<motion.div
    animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
    }}
    transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
    }}
    className="absolute ... blur-3xl"
>
    {/* Rotating gradient blob */}
</motion.div>
```

### 6. **Pulsing Animations**
```tsx
<motion.div
    animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
    }}
    transition={{
        duration: 2,
        repeat: Infinity,
    }}
>
    {/* Pulsing indicator */}
</motion.div>
```

### 7. **AnimatePresence** (Conditional Rendering)
```tsx
<AnimatePresence>
    {condition && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
        >
            {/* Smooth enter/exit */}
        </motion.div>
    )}
</AnimatePresence>
```

### 8. **List Animations** (Staggered)
```tsx
{items.map((item, index) => (
    <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
    >
        {/* List item dengan delay */}
    </motion.div>
))}
```

---

## 🌑 Dark Mode Classes

### Background Colors:
```css
/* Main background */
bg-slate-50 dark:bg-black

/* Container background */
bg-white/50 dark:bg-slate-900/50

/* Card background */
bg-white/80 dark:bg-slate-900/80
```

### Border Colors:
```css
/* Subtle borders */
border-slate-200/50 dark:border-slate-800/50

/* Accent borders */
border-blue-500/30 dark:border-blue-500/30
```

### Text Colors:
```css
/* Primary text */
text-slate-900 dark:text-white

/* Secondary text */
text-slate-500 dark:text-slate-400

/* Muted text */
text-slate-400 dark:text-slate-500
```

### Status Colors (Dark Mode):
```css
/* Success */
bg-emerald-500/20 text-emerald-400 border-emerald-500/30

/* Warning */
bg-amber-500/20 text-amber-400 border-amber-500/30

/* Error */
bg-red-500/20 text-red-400 border-red-500/30

/* Info */
bg-blue-500/20 text-blue-400 border-blue-500/30
```

---

## 💎 Glass Morphism Effect

```css
/* Basic glass effect */
bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl

/* With border */
border border-slate-200/50 dark:border-slate-800/50

/* Complete glass card */
className="
    rounded-2xl 
    border border-slate-200/50 dark:border-slate-800/50
    bg-white/50 dark:bg-slate-900/50 
    shadow-xl 
    backdrop-blur-xl
"
```

---

## 🎨 Gradient Backgrounds

### Header Gradient:
```tsx
<div className="
    bg-gradient-to-br 
    from-blue-600 
    via-purple-600 
    to-pink-600
">
    {/* Gradient header */}
</div>
```

### Status Gradients:
```tsx
// Success
bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10

// Warning
bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10
```

### Chart Gradients:
```tsx
<defs>
    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
    </linearGradient>
</defs>
<Bar fill="url(#colorGradient)" />
```

---

## 🎯 Interactive Elements

### Buttons:
```tsx
<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="
        rounded-xl 
        bg-blue-500/20 
        text-blue-400 
        hover:bg-blue-500/30 
        border border-blue-500/30
        transition-all
    "
>
    Button
</motion.button>
```

### Cards:
```tsx
<motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    className="
        rounded-2xl 
        border border-slate-200/50 dark:border-slate-800/50
        bg-white/50 dark:bg-slate-900/50 
        p-6 
        shadow-xl 
        backdrop-blur-xl
    "
>
    Card Content
</motion.div>
```

### Icons:
```tsx
<motion.div
    whileHover={{ rotate: 360, scale: 1.1 }}
    transition={{ duration: 0.5 }}
    className="
        flex h-12 w-12 
        items-center justify-center 
        rounded-xl 
        bg-blue-500/20 
        text-blue-400 
        border border-blue-500/30
    "
>
    <Icon className="h-6 w-6" />
</motion.div>
```

---

## 📊 Chart Styling (Dark Mode)

### Recharts Configuration:
```tsx
<ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
        <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#334155" 
            opacity={0.1} 
        />
        <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            stroke="#475569" 
        />
        <YAxis 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            stroke="#475569" 
        />
        <Tooltip
            contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                color: '#fff'
            }}
        />
        <Bar 
            dataKey="value" 
            fill="url(#gradient)" 
            radius={[8, 8, 0, 0]} 
        />
    </BarChart>
</ResponsiveContainer>
```

---

## 🎪 Special Effects

### Rotating Blobs (Background):
```tsx
<motion.div
    animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
    }}
    transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
    }}
    className="
        absolute -right-20 -top-20 
        h-64 w-64 
        rounded-full 
        bg-white/10 
        blur-3xl
    "
/>
```

### LIVE Indicator:
```tsx
<motion.span
    animate={{
        opacity: [1, 0.5, 1],
    }}
    transition={{
        duration: 1.5,
        repeat: Infinity,
    }}
    className="
        inline-flex items-center gap-1.5 
        px-3 py-1 
        rounded-full 
        text-xs font-bold 
        bg-emerald-500 
        text-white
    "
>
    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
    LIVE
</motion.span>
```

### Pulsing Dot:
```tsx
<motion.div
    animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
    }}
    transition={{
        duration: 2,
        repeat: Infinity,
    }}
    className="h-2 w-2 rounded-full bg-emerald-500"
/>
```

---

## 🚀 Performance Tips

1. **Use `will-change` sparingly**
   ```css
   /* Only for frequently animated elements */
   will-change: transform, opacity;
   ```

2. **Prefer `transform` over position changes**
   ```tsx
   // Good ✅
   animate={{ scale: 1.05, y: -5 }}
   
   // Avoid ❌
   animate={{ top: -5, width: '105%' }}
   ```

3. **Use `AnimatePresence` for conditional rendering**
   ```tsx
   <AnimatePresence mode="wait">
       {/* Smooth transitions */}
   </AnimatePresence>
   ```

4. **Optimize list animations**
   ```tsx
   // Use keys and limit stagger delay
   transition={{ delay: Math.min(index * 0.05, 0.5) }}
   ```

---

## 📱 Responsive Considerations

```tsx
// Disable animations on mobile if needed
const isMobile = window.innerWidth < 768;

<motion.div
    animate={!isMobile ? { scale: 1.05 } : {}}
>
    {/* Conditional animation */}
</motion.div>
```

---

## 🎉 Complete Example

```tsx
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="
        rounded-2xl 
        border border-slate-200/50 dark:border-slate-800/50
        bg-white/50 dark:bg-slate-900/50 
        p-6 
        shadow-xl 
        backdrop-blur-xl
        transition-all
    "
>
    <div className="flex items-center gap-4">
        <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="
                flex h-12 w-12 
                items-center justify-center 
                rounded-xl 
                bg-blue-500/20 
                text-blue-400 
                border border-blue-500/30
            "
        >
            <Icon className="h-6 w-6" />
        </motion.div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Label
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                Value
            </p>
        </div>
    </div>
</motion.div>
```

---

**Happy Animating! 🎨✨**
