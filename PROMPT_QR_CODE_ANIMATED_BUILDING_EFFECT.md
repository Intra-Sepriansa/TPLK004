# PROMPT: QR CODE ANIMATED BUILDING EFFECT - ULTRA ADVANCED

## TUJUAN
Membuat animasi QR Code yang sangat menarik dimana garis-garis, kotak-kotak, dan elemen-elemen QR Code beranimasi membentuk QR Code secara bertahap (building/drawing effect). Animasi ini memberikan kesan futuristik dan high-tech seperti QR Code sedang "di-render" atau "di-generate" secara real-time.

---

## KONSEP ANIMASI

### Ide Utama
QR Code tidak langsung muncul secara utuh, tetapi:
1. **Garis-garis** muncul satu per satu dengan efek drawing
2. **Kotak-kotak** (squares) muncul dengan efek scale dari 0 ke 1
3. **Modul-modul** QR Code muncul secara berurutan (sequential)
4. **Corner markers** (3 kotak besar di sudut) muncul terlebih dahulu
5. **Pattern** QR Code terbentuk dari luar ke dalam atau dari dalam ke luar
6. **Glow effect** mengikuti setiap elemen yang baru muncul

### Tahapan Animasi (Sequential)

**FASE 1: Corner Markers (0-1 detik)**
- 3 kotak besar di sudut (top-left, top-right, bottom-left) muncul terlebih dahulu
- Setiap corner marker terdiri dari 3 layer: outer square, middle square, inner square
- Animasi: Garis luar tergambar searah jarum jam → garis tengah → kotak dalam muncul

**FASE 2: Timing Pattern (1-1.5 detik)**
- Garis horizontal dan vertikal yang menghubungkan corner markers
- Animasi: Garis tergambar dari corner ke corner dengan efek stroke-dasharray

**FASE 3: Data Modules (1.5-3 detik)**
- Kotak-kotak kecil (modules) muncul secara berurutan
- Pattern: Spiral dari luar ke dalam, atau wave pattern dari kiri ke kanan
- Setiap module muncul dengan scale animation + glow effect

**FASE 4: Final Touch (3-3.5 detik)**
- Semua elemen sudah terbentuk
- Glow effect menyebar ke seluruh QR Code
- QR Code "berkedip" sekali sebagai tanda selesai

---

## TECH STACK & LIBRARIES

### 1. Framer Motion (Primary Animation Library)
```bash
npm install framer-motion
```

**Kenapa Framer Motion?**
- Declarative animation API yang mudah
- Support untuk SVG path animation
- Stagger children untuk sequential animation
- Custom variants untuk complex animations
- Performance optimization built-in

### 2. React + TypeScript
```bash
# Sudah ada di project
```

### 3. SVG untuk QR Code Structure
- Native SVG elements untuk kontrol penuh
- Path animation dengan `pathLength`
- Transform origin untuk scale animations

### 4. Optional: QRCode.react (untuk generate QR data)
```bash
npm install qrcode.react
```

---

## IMPLEMENTASI DETAIL

### Struktur QR Code SVG

```tsx
// QR Code terdiri dari:
// 1. Corner Markers (3 buah)
// 2. Timing Patterns (garis horizontal & vertikal)
// 3. Data Modules (kotak-kotak kecil)
// 4. Alignment Patterns (untuk QR Code besar)

const QRCodeAnimated = ({ data, size = 300 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background */}
      <rect width="100" height="100" fill="#1a1a2e" rx="12" />
      
      {/* Corner Markers */}
      <CornerMarker position="top-left" delay={0} />
      <CornerMarker position="top-right" delay={0.2} />
      <CornerMarker position="bottom-left" delay={0.4} />
      
      {/* Timing Patterns */}
      <TimingPattern direction="horizontal" delay={1} />
      <TimingPattern direction="vertical" delay={1.2} />
      
      {/* Data Modules */}
      <DataModules pattern="spiral" delay={1.5} />
      
      {/* Glow Effects */}
      <GlowEffect />
    </motion.svg>
  );
};
```

### 1. CORNER MARKER ANIMATION

```tsx
const CornerMarker = ({ position, delay }) => {
  // Posisi corner markers
  const positions = {
    'top-left': { x: 10, y: 10 },
    'top-right': { x: 70, y: 10 },
    'bottom-left': { x: 10, y: 70 },
  };
  
  const pos = positions[position];
  
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {/* Outer Square - Drawing Animation */}
      <motion.rect
        x="0"
        y="0"
        width="20"
        height="20"
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        rx="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: delay,
          ease: "easeInOut"
        }}
      />
      
      {/* Middle Square - Drawing Animation */}
      <motion.rect
        x="3"
        y="3"
        width="14"
        height="14"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        rx="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: delay + 0.3,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner Square - Scale Animation */}
      <motion.rect
        x="6"
        y="6"
        width="8"
        height="8"
        fill="#a78bfa"
        rx="1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: delay + 0.6,
          ease: "backOut"
        }}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* Glow Effect */}
      <motion.rect
        x="0"
        y="0"
        width="20"
        height="20"
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        rx="2"
        opacity="0"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: [0, 0.6, 0],
          scale: [1, 1.2, 1.4]
        }}
        transition={{
          duration: 0.8,
          delay: delay + 0.8,
          ease: "easeOut"
        }}
        style={{ transformOrigin: 'center' }}
      />
    </g>
  );
};
```

### 2. TIMING PATTERN ANIMATION

```tsx
const TimingPattern = ({ direction, delay }) => {
  // Timing pattern adalah garis dengan kotak-kotak kecil bergantian
  const isHorizontal = direction === 'horizontal';
  
  return (
    <g>
      {/* Main Line - Drawing from start to end */}
      <motion.line
        x1={isHorizontal ? "30" : "30"}
        y1={isHorizontal ? "30" : "30"}
        x2={isHorizontal ? "70" : "30"}
        y2={isHorizontal ? "30" : "70"}
        stroke="#6366f1"
        strokeWidth="0.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: "easeInOut"
        }}
      />
      
      {/* Small squares along the line */}
      {Array.from({ length: 8 }).map((_, i) => {
        const offset = 30 + (i * 5);
        return (
          <motion.rect
            key={i}
            x={isHorizontal ? offset : 29}
            y={isHorizontal ? 29 : offset}
            width="2"
            height="2"
            fill={i % 2 === 0 ? "#6366f1" : "transparent"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: delay + (i * 0.05),
              ease: "backOut"
            }}
            style={{ transformOrigin: 'center' }}
          />
        );
      })}
    </g>
  );
};
```

### 3. DATA MODULES ANIMATION (SPIRAL PATTERN)

```tsx
const DataModules = ({ pattern, delay }) => {
  // Generate QR code modules (simplified)
  // Dalam implementasi real, gunakan library QR code generator
  const modules = generateQRModules(); // Returns array of {x, y, filled}
  
  // Sort modules based on pattern
  const sortedModules = pattern === 'spiral' 
    ? sortSpiral(modules)
    : sortWave(modules);
  
  return (
    <g>
      {sortedModules.map((module, index) => (
        <motion.rect
          key={`${module.x}-${module.y}`}
          x={module.x}
          y={module.y}
          width="2"
          height="2"
          fill={module.filled ? "#6366f1" : "transparent"}
          rx="0.3"
          initial={{ 
            scale: 0, 
            opacity: 0,
            filter: "blur(4px)"
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            filter: "blur(0px)"
          }}
          transition={{
            duration: 0.15,
            delay: delay + (index * 0.008), // Stagger effect
            ease: "backOut"
          }}
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </g>
  );
};

// Helper: Sort modules in spiral pattern (outside to inside)
const sortSpiral = (modules) => {
  const center = { x: 50, y: 50 };
  return modules.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - center.x, 2) + Math.pow(a.y - center.y, 2));
    const distB = Math.sqrt(Math.pow(b.x - center.x, 2) + Math.pow(b.y - center.y, 2));
    return distB - distA; // Outside to inside
  });
};

// Helper: Sort modules in wave pattern (left to right, top to bottom)
const sortWave = (modules) => {
  return modules.sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });
};
```

### 4. GLOW EFFECT ANIMATION

```tsx
const GlowEffect = () => {
  return (
    <defs>
      {/* Animated Glow Filter */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      {/* Animated Gradient */}
      <motion.linearGradient
        id="animatedGradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <motion.stop
          offset="0%"
          stopColor="#6366f1"
          animate={{
            stopColor: ["#6366f1", "#8b5cf6", "#a78bfa", "#6366f1"]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.stop
          offset="100%"
          stopColor="#8b5cf6"
          animate={{
            stopColor: ["#8b5cf6", "#a78bfa", "#6366f1", "#8b5cf6"]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.linearGradient>
    </defs>
  );
};
```

### 5. SCANNING LINE EFFECT (OPTIONAL)

```tsx
const ScanningLine = () => {
  return (
    <motion.line
      x1="0"
      y1="0"
      x2="100"
      y2="0"
      stroke="url(#scanGradient)"
      strokeWidth="2"
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: [0, 100, 0],
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: 2,
        delay: 1.5,
        ease: "easeInOut"
      }}
    />
  );
};
```

---

## ANIMATION VARIANTS

```tsx
// Container Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

// Module Variants (untuk kotak-kotak kecil)
const moduleVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    filter: "blur(4px)",
    rotate: -180
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: "blur(0px)",
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
} as const;

// Line Drawing Variants
const lineVariants = {
  hidden: { 
    pathLength: 0, 
    opacity: 0 
  },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.3
      }
    },
  },
} as const;

// Glow Pulse Variants
const glowVariants = {
  initial: { 
    opacity: 0, 
    scale: 1,
    filter: "blur(0px)"
  },
  animate: { 
    opacity: [0, 0.8, 0],
    scale: [1, 1.3, 1.5],
    filter: ["blur(0px)", "blur(4px)", "blur(8px)"],
    transition: {
      duration: 1.5,
      ease: "easeOut"
    },
  },
} as const;
```

---

## COMPLETE COMPONENT EXAMPLE

```tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface QRCodeAnimatedProps {
  data: string;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export const QRCodeAnimated: React.FC<QRCodeAnimatedProps> = ({
  data,
  size = 300,
  color = '#6366f1',
  onComplete
}) => {
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    // Trigger onComplete after animation finishes
    const timer = setTimeout(() => {
      setIsComplete(true);
      onComplete?.();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="relative">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        initial="hidden"
        animate="visible"
        className="drop-shadow-2xl"
      >
        {/* Definitions */}
        <defs>
          {/* Glow Filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Scan Gradient */}
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0"/>
            <stop offset="50%" stopColor={color} stopOpacity="1"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Background with rounded corners */}
        <motion.rect
          width="100"
          height="100"
          fill="#0f0f1e"
          rx="12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Corner Markers */}
        <CornerMarker position="top-left" delay={0} color={color} />
        <CornerMarker position="top-right" delay={0.2} color={color} />
        <CornerMarker position="bottom-left" delay={0.4} color={color} />
        
        {/* Timing Patterns */}
        <TimingPattern direction="horizontal" delay={1} color={color} />
        <TimingPattern direction="vertical" delay={1.2} color={color} />
        
        {/* Data Modules */}
        <DataModules data={data} delay={1.5} color={color} />
        
        {/* Scanning Line Effect */}
        <ScanningLine delay={1.5} />
        
        {/* Final Glow Pulse */}
        {isComplete && (
          <motion.rect
            width="100"
            height="100"
            fill="none"
            stroke={color}
            strokeWidth="2"
            rx="12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0.95, 1, 1.05]
            }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
          />
        )}
      </motion.svg>
      
      {/* Status Indicator */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5 }}
      >
        <span className="text-indigo-400">
          {isComplete ? '✓ QR Code Ready' : 'Generating...'}
        </span>
      </motion.div>
    </div>
  );
};
```

---

## USAGE EXAMPLE

```tsx
// Di halaman QR Builder
import { QRCodeAnimated } from '@/components/ui/qr-code-animated';

const QRBuilderPage = () => {
  const [qrData, setQrData] = useState('https://example.com');
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-8">
          QR Code Generator
        </h1>
        
        <QRCodeAnimated
          data={qrData}
          size={400}
          color="#6366f1"
          onComplete={() => {
            console.log('QR Code animation complete!');
          }}
        />
        
        <input
          type="text"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          className="mt-8 px-4 py-2 rounded-lg bg-neutral-800 text-white"
          placeholder="Enter data for QR Code"
        />
      </div>
    </div>
  );
};
```

---

## ADVANCED FEATURES

### 1. Multiple Animation Patterns

```tsx
type AnimationPattern = 'spiral' | 'wave' | 'random' | 'center-out' | 'corners-in';

const getModuleDelay = (
  module: { x: number; y: number },
  pattern: AnimationPattern,
  index: number
): number => {
  switch (pattern) {
    case 'spiral':
      // Calculate distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(module.x - 50, 2) + Math.pow(module.y - 50, 2)
      );
      return distFromCenter * 0.01;
      
    case 'wave':
      // Left to right, top to bottom
      return (module.x + module.y) * 0.005;
      
    case 'random':
      // Random delay
      return Math.random() * 0.5;
      
    case 'center-out':
      // From center to edges
      const distFromCenterOut = Math.sqrt(
        Math.pow(module.x - 50, 2) + Math.pow(module.y - 50, 2)
      );
      return (50 - distFromCenterOut) * 0.01;
      
    case 'corners-in':
      // From corners to center
      const corners = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 }
      ];
      const minDist = Math.min(
        ...corners.map(corner =>
          Math.sqrt(Math.pow(module.x - corner.x, 2) + Math.pow(module.y - corner.y, 2))
        )
      );
      return minDist * 0.01;
      
    default:
      return index * 0.008;
  }
};
```

### 2. Color Themes

```tsx
const colorThemes = {
  indigo: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    bg: '#0f0f1e'
  },
  cyan: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    bg: '#0a1929'
  },
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    bg: '#0a1f1a'
  },
  pink: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    bg: '#1f0a1a'
  }
};
```

### 3. Interactive Hover Effects

```tsx
const InteractiveModule = ({ module, index, delay }) => {
  return (
    <motion.rect
      x={module.x}
      y={module.y}
      width="2"
      height="2"
      fill={module.filled ? "#6366f1" : "transparent"}
      rx="0.3"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.5, 
        fill: "#a78bfa",
        transition: { duration: 0.2 }
      }}
      transition={{
        duration: 0.15,
        delay: delay,
        ease: "backOut"
      }}
      style={{ 
        transformOrigin: 'center',
        cursor: 'pointer'
      }}
    />
  );
};
```

---

## PERFORMANCE OPTIMIZATION

### 1. Use `will-change` CSS property
```tsx
<motion.rect
  style={{ 
    willChange: 'transform, opacity',
    transformOrigin: 'center'
  }}
/>
```

### 2. Reduce number of animated elements
```tsx
// Instead of animating 1000+ modules individually,
// group them into chunks
const CHUNK_SIZE = 50;
const chunks = chunkArray(modules, CHUNK_SIZE);
```

### 3. Use `layoutId` for shared element transitions
```tsx
<motion.rect layoutId={`module-${index}`} />
```

---

## KESIMPULAN

Animasi QR Code dengan building effect ini menggunakan:

1. **Framer Motion** untuk semua animasi
2. **SVG** untuk struktur QR Code
3. **Sequential Animation** dengan stagger effect
4. **Path Drawing** untuk garis-garis
5. **Scale Animation** untuk kotak-kotak
6. **Glow Effects** untuk visual enhancement
7. **Multiple Patterns** (spiral, wave, random, dll)

Animasi ini memberikan kesan:
- Futuristik dan high-tech
- QR Code sedang "di-generate" secara real-time
- Professional dan smooth
- Engaging dan menarik perhatian

Total durasi animasi: 3-3.5 detik
Performance: Optimized dengan chunking dan will-change
Customizable: Color themes, patterns, timing
