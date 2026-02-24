# 🌳 PROMPT ULTRA ADVANCED: SVG TREE ANIMATION FROM STUDENT NAME
## Animasi Pohon SVG yang Tumbuh dari Huruf Nama Mahasiswa

---

## 📋 OVERVIEW KONSEP

### Ide Utama
Membuat animasi pohon SVG yang **tumbuh secara organik** dari bawah ke atas menggunakan huruf-huruf dari nama mahasiswa. Pohon ini akan:
- Dimulai dari akar yang muncul dari bawah dengan path animation
- Batang tumbuh ke atas dengan stroke-dasharray animation
- Cabang-cabang menyebar ke samping dengan stagger effect
- Daun-daun bermunculan dari huruf nama mahasiswa dengan scale animation
- Efek angin yang membuat daun bergoyang menggunakan CSS transforms
- Partikel jatuh seperti daun gugur dengan SVG animate elements

### Mengapa SVG?
SVG (Scalable Vector Graphics) dipilih karena:
- **Scalable**: Tetap tajam di semua ukuran layar dan resolusi
- **Lightweight**: File size lebih kecil dibanding Canvas
- **CSS Animatable**: Mudah di-animate dengan CSS dan JavaScript
- **Accessible**: Screen reader friendly, bisa diberi aria-labels
- **GPU Accelerated**: Browser optimize SVG animations dengan hardware acceleration
- **Declarative**: Struktur XML yang mudah dibaca dan di-maintain
- **Inspectable**: Bisa di-inspect di DevTools seperti HTML biasa

### Penempatan
Area kosong di sebelah foto profil pada halaman Edit Mahasiswa (seperti dashboard admin)

### Dimensi SVG
```xml
<svg 
  viewBox="0 0 500 400" 
  width="100%" 
  height="100%"
  preserveAspectRatio="xMidYMid meet"
>
  <!-- Tree content -->
</svg>
```

**Keuntungan viewBox:**
- Responsive otomatis tanpa JavaScript
- Aspect ratio terjaga
- Koordinat konsisten di semua ukuran

---

## 🎨 VISUAL DESIGN

### Color Scheme (Emerald Theme)
```css
:root {
  /* Trunk colors */
  --trunk-base: #78350f;
  --trunk-highlight: #92400e;
  --trunk-shadow: #451a03;
  
  /* Leaf colors */
  --leaf-primary: #10b981;
  --leaf-secondary: #34d399;
  --leaf-tertiary: #6ee7b7;
  --leaf-accent: #a7f3d0;
  
  /* Background */
  --bg-sky-start: #0f172a;
  --bg-sky-end: #1e293b;
  --bg-ground: #334155;
  
  /* Glow effects */
  --glow-emerald: rgba(16, 185, 129, 0.3);
  --glow-amber: rgba(251, 191, 36, 0.2);
}
```

---

## 🌲 SVG TREE STRUCTURE

### Stage 1: Akar (0-1 detik)
```xml
<!-- Root system dengan path animation -->
<g id="roots" class="tree-roots">
  <path 
    d="M 250 350 L 250 380" 
    stroke="var(--trunk-base)"
    stroke-width="3"
    fill="none"
    class="root-center"
  />
  <path 
    d="M 250 370 L 230 390" 
    stroke="var(--trunk-base)"
    stroke-width="2"
    fill="none"
    class="root-left"
  />
  <path 
    d="M 250 370 L 270 390" 
    stroke="var(--trunk-base)"
    stroke-width="2"
    fill="none"
    class="root-right"
  />
</g>
```

**Konsep Animasi:**
- Menggunakan `stroke-dasharray` dan `stroke-dashoffset`
- Path "tergambar" dari bawah ke atas
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### Stage 2: Batang Tumbuh (1-2 detik)
```xml
<!-- Trunk dengan gradient dan stroke animation -->
<defs>
  <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="var(--trunk-shadow)" />
    <stop offset="50%" stop-color="var(--trunk-base)" />
    <stop offset="100%" stop-color="var(--trunk-highlight)" />
  </linearGradient>
</defs>

<g id="trunk" class="tree-trunk">
  <rect 
    x="240" 
    y="200" 
    width="20" 
    height="150"
    fill="url(#trunkGradient)"
    rx="2"
    class="trunk-main"
  />
  <!-- Texture lines -->
  <line x1="245" y1="210" x2="245" y2="340" stroke="var(--trunk-shadow)" stroke-width="1" opacity="0.3" />
  <line x1="255" y1="210" x2="255" y2="340" stroke="var(--trunk-highlight)" stroke-width="1" opacity="0.3" />
</g>
```

**Konsep Animasi:**
- Height animasi dari 0 ke 150
- Menggunakan CSS `transform: scaleY()` dari origin bottom
- Duration: 1.5s dengan bounce easing

### Stage 3: Cabang Menyebar (2-3 detik)
```xml
<!-- Branches dengan bezier curves -->
<g id="branches" class="tree-branches">
  <!-- Left branch -->
  <path 
    d="M 250 250 Q 200 230, 180 220" 
    stroke="var(--trunk-base)"
    stroke-width="4"
    fill="none"
    class="branch-left"
  />
  <!-- Right branch -->
  <path 
    d="M 250 250 Q 300 230, 320 220" 
    stroke="var(--trunk-base)"
    stroke-width="4"
    fill="none"
    class="branch-right"
  />
  <!-- Upper branches -->
  <path 
    d="M 250 220 Q 220 200, 200 190" 
    stroke="var(--trunk-base)"
    stroke-width="3"
    fill="none"
    class="branch-upper-left"
  />
  <path 
    d="M 250 220 Q 280 200, 300 190" 
    stroke="var(--trunk-base)"
    stroke-width="3"
    fill="none"
    class="branch-upper-right"
  />
</g>
```

**Konsep Animasi:**
- Stroke-dasharray animation seperti roots
- Stagger delay: 100ms antar cabang
- Easing: elastic out untuk efek "spring"

### Stage 4: Daun Bermunculan (3-5 detik)
```xml
<!-- Leaves dari huruf nama mahasiswa -->
<g id="leaves" class="tree-leaves">
  <!-- Setiap huruf jadi SVG text element -->
  <text 
    x="200" 
    y="190" 
    class="leaf-char"
    fill="var(--leaf-primary)"
    font-family="'Courier New', monospace"
    font-size="20"
    font-weight="bold"
    text-anchor="middle"
    data-char="A"
    data-index="0"
  >A</text>
  
  <text 
    x="230" 
    y="180" 
    class="leaf-char"
    fill="var(--leaf-secondary)"
    font-family="'Courier New', monospace"
    font-size="20"
    font-weight="bold"
    text-anchor="middle"
    data-char="B"
    data-index="1"
  >B</text>
  
  <!-- ... more characters ... -->
</g>
```

**Konsep Animasi:**
- Scale dari 0 ke 1 dengan bounce
- Opacity dari 0 ke 1
- Rotate sedikit untuk efek natural
- Stagger: 100ms per huruf

### Stage 5: Pohon Lengkap dengan Animasi Ambient
```xml
<!-- Glow effects dengan SVG filters -->
<defs>
  <filter id="glow">
    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  
  <filter id="drop-shadow">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
    <feOffset dx="0" dy="2" result="offsetblur"/>
    <feComponentTransfer>
      <feFuncA type="linear" slope="0.3"/>
    </feComponentTransfer>
    <feMerge>
      <feMergeNode/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

<!-- Apply filters -->
<g filter="url(#glow)">
  <!-- Leaves with glow -->
</g>
```

---

## 🎯 TECHNICAL IMPLEMENTATION

### Tech Stack Recommendation

#### Recommended: React + SVG + CSS Animations
```typescript
{
  core: 'React + TypeScript',
  rendering: 'SVG (inline)',
  animation: 'CSS Animations + Framer Motion',
  performance: '⭐⭐⭐⭐⭐',
  flexibility: '⭐⭐⭐⭐⭐',
  accessibility: '⭐⭐⭐⭐⭐',
  maintainability: '⭐⭐⭐⭐⭐'
}
```

**Mengapa kombinasi ini?**
- SVG inline: Full control dengan React
- CSS Animations: Hardware accelerated, smooth
- Framer Motion: Orchestration dan complex sequences
- TypeScript: Type safety untuk props dan state

---

## 💻 IMPLEMENTATION CODE

### 1. Component Structure
```tsx
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface SVGTreeProps {
  studentName: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  theme?: 'emerald' | 'autumn' | 'winter';
}

const SVGTreeAnimation: React.FC<SVGTreeProps> = ({
  studentName,
  width = 500,
  height = 400,
  autoPlay = true,
  theme = 'emerald'
}) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  // Process student name into characters
  const nameChars = useMemo(() => {
    return studentName
      .toUpperCase()
      .replace(/\s/g, '')
      .split('');
  }, [studentName]);
  
  // Generate leaf positions
  const leafPositions = useMemo(() => {
    return generateLeafPositions(nameChars.length);
  }, [nameChars.length]);
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 
      rounded-xl overflow-hidden border border-slate-700">
      
      {/* SVG Tree */}
      <svg
        viewBox="0 0 500 400"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.1))' }}
      >
        {/* Definitions */}
        <defs>
          <TreeGradients />
          <TreeFilters />
        </defs>
        
        {/* Background */}
        <TreeBackground />
        
        {/* Tree Structure */}
        <TreeRoots isPlaying={isPlaying} stage={animationStage} />
        <TreeTrunk isPlaying={isPlaying} stage={animationStage} />
        <TreeBranches isPlaying={isPlaying} stage={animationStage} />
        <TreeLeaves 
          chars={nameChars}
          positions={leafPositions}
          isPlaying={isPlaying}
          stage={animationStage}
        />
        
        {/* Particles */}
        <FallingLeaves isPlaying={isPlaying} stage={animationStage} />
      </svg>
      
      {/* Controls Overlay */}
      <TreeControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={() => setAnimationStage(0)}
        stage={animationStage}
      />
    </div>
  );
};

export default SVGTreeAnimation;
```

### 2. SVG Tree Components

#### A. Tree Gradients & Filters
```tsx
const TreeGradients: React.FC = () => (
  <>
    {/* Trunk gradient */}
    <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#451a03" />
      <stop offset="50%" stopColor="#78350f" />
      <stop offset="100%" stopColor="#92400e" />
    </linearGradient>
    
    {/* Sky gradient */}
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#1e293b" />
    </linearGradient>
  </>
);

const TreeFilters: React.FC = () => (
  <>
    {/* Glow filter */}
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    {/* Drop shadow */}
    <filter id="dropShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </>
);
```

#### B. Tree Roots Component
```tsx
interface TreeRootsProps {
  isPlaying: boolean;
  stage: number;
}

const TreeRoots: React.FC<TreeRootsProps> = ({ isPlaying, stage }) => {
  return (
    <motion.g
      id="roots"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage >= 1 ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Center root */}
      <motion.path
        d="M 250 350 L 250 380"
        stroke="#78350f"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isPlaying && stage >= 1 ? 1 : 0 }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Left root */}
      <motion.path
        d="M 250 370 L 230 390"
        stroke="#78350f"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isPlaying && stage >= 1 ? 1 : 0 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Right root */}
      <motion.path
        d="M 250 370 L 270 390"
        stroke="#78350f"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isPlaying && stage >= 1 ? 1 : 0 }}
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
    </motion.g>
  );
};
```

#### C. Tree Trunk Component
```tsx
interface TreeTrunkProps {
  isPlaying: boolean;
  stage: number;
}

const TreeTrunk: React.FC<TreeTrunkProps> = ({ isPlaying, stage }) => {
  return (
    <motion.g
      id="trunk"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage >= 2 ? 1 : 0 }}
    >
      {/* Main trunk */}
      <motion.rect
        x="240"
        y="200"
        width="20"
        height="150"
        fill="url(#trunkGradient)"
        rx="2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isPlaying && stage >= 2 ? 1 : 0 }}
        transition={{
          duration: 1.5,
          ease: [0.34, 1.56, 0.64, 1] // Bounce easing
        }}
        style={{ transformOrigin: '250px 350px' }}
      />
      
      {/* Texture lines */}
      <motion.line
        x1="245" y1="210" x2="245" y2="340"
        stroke="#451a03"
        strokeWidth="1"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isPlaying && stage >= 2 ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      <motion.line
        x1="255" y1="210" x2="255" y2="340"
        stroke="#92400e"
        strokeWidth="1"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isPlaying && stage >= 2 ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </motion.g>
  );
};
```


#### D. Tree Branches Component
```tsx
interface TreeBranchesProps {
  isPlaying: boolean;
  stage: number;
}

const TreeBranches: React.FC<TreeBranchesProps> = ({ isPlaying, stage }) => {
  const branches = [
    { d: "M 250 250 Q 200 230, 180 220", delay: 0 },
    { d: "M 250 250 Q 300 230, 320 220", delay: 0.1 },
    { d: "M 250 220 Q 220 200, 200 190", delay: 0.2 },
    { d: "M 250 220 Q 280 200, 300 190", delay: 0.3 },
    { d: "M 250 200 Q 230 180, 210 170", delay: 0.4 },
    { d: "M 250 200 Q 270 180, 290 170", delay: 0.5 },
  ];
  
  return (
    <motion.g
      id="branches"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage >= 3 ? 1 : 0 }}
    >
      {branches.map((branch, index) => (
        <motion.path
          key={index}
          d={branch.d}
          stroke="#78350f"
          strokeWidth={4 - index * 0.3}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isPlaying && stage >= 3 ? 1 : 0 }}
          transition={{
            duration: 0.8,
            delay: branch.delay,
            ease: [0.68, -0.55, 0.265, 1.55] // Elastic easing
          }}
        />
      ))}
    </motion.g>
  );
};
```

#### E. Tree Leaves Component
```tsx
interface TreeLeavesProps {
  chars: string[];
  positions: LeafPosition[];
  isPlaying: boolean;
  stage: number;
}

const TreeLeaves: React.FC<TreeLeavesProps> = ({ 
  chars, 
  positions, 
  isPlaying, 
  stage 
}) => {
  const leafColors = [
    '#10b981', // emerald-500
    '#34d399', // emerald-400
    '#6ee7b7', // emerald-300
    '#a7f3d0', // emerald-200
  ];
  
  return (
    <motion.g
      id="leaves"
      filter="url(#glow)"
    >
      {chars.map((char, index) => {
        const pos = positions[index];
        const color = leafColors[index % leafColors.length];
        
        return (
          <motion.text
            key={index}
            x={pos.x}
            y={pos.y}
            fill={color}
            fontFamily="'Courier New', monospace"
            fontSize="20"
            fontWeight="bold"
            textAnchor="middle"
            initial={{ 
              scale: 0, 
              opacity: 0,
              rotate: -45 
            }}
            animate={{ 
              scale: isPlaying && stage >= 4 ? 1 : 0,
              opacity: isPlaying && stage >= 4 ? 1 : 0,
              rotate: 0
            }}
            transition={{
              duration: 0.6,
              delay: 3.5 + (index * 0.1),
              ease: [0.34, 1.56, 0.64, 1] // Bounce
            }}
            style={{
              transformOrigin: `${pos.x}px ${pos.y}px`
            }}
          >
            {char}
            
            {/* Wind animation - continuous after appearing */}
            {isPlaying && stage >= 5 && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`0 ${pos.x} ${pos.y}; ${3 + Math.sin(index) * 2} ${pos.x} ${pos.y}; 0 ${pos.x} ${pos.y}`}
                dur={`${2 + (index % 3) * 0.5}s`}
                repeatCount="indefinite"
              />
            )}
          </motion.text>
        );
      })}
    </motion.g>
  );
};
```

### 3. Helper Functions

#### Generate Leaf Positions
```typescript
interface LeafPosition {
  x: number;
  y: number;
  level: number;
}

function generateLeafPositions(charCount: number): LeafPosition[] {
  const positions: LeafPosition[] = [];
  const centerX = 250;
  const startY = 170;
  const levels = 5;
  const baseSpread = 160;
  
  let charIndex = 0;
  
  for (let level = 0; level < levels && charIndex < charCount; level++) {
    const y = startY - (level * 35);
    const spread = baseSpread - (level * 20);
    const charsInLevel = Math.min(
      Math.ceil((level + 3) * 1.5),
      charCount - charIndex
    );
    
    for (let i = 0; i < charsInLevel && charIndex < charCount; i++) {
      const x = centerX - spread/2 + (i * (spread / (charsInLevel - 1 || 1)));
      
      positions.push({
        x: x + (Math.random() - 0.5) * 10, // Add slight randomness
        y: y + (Math.random() - 0.5) * 5,
        level
      });
      
      charIndex++;
    }
  }
  
  return positions;
}
```


### 4. Falling Leaves Particle System

```tsx
interface FallingLeavesProps {
  isPlaying: boolean;
  stage: number;
}

const FallingLeaves: React.FC<FallingLeavesProps> = ({ isPlaying, stage }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    if (!isPlaying || stage < 5) return;
    
    const interval = setInterval(() => {
      // Add new particle randomly
      if (Math.random() < 0.1) { // 10% chance per interval
        const newParticle: Particle = {
          id: Date.now(),
          x: 150 + Math.random() * 200,
          y: 150,
          char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          color: ['#10b981', '#34d399', '#6ee7b7'][Math.floor(Math.random() * 3)],
          rotation: Math.random() * 360,
          duration: 3 + Math.random() * 2
        };
        
        setParticles(prev => [...prev, newParticle]);
        
        // Remove after animation
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, newParticle.duration * 1000);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [isPlaying, stage]);
  
  return (
    <g id="falling-leaves">
      {particles.map(particle => (
        <motion.text
          key={particle.id}
          x={particle.x}
          y={particle.y}
          fill={particle.color}
          fontFamily="'Courier New', monospace"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          initial={{ 
            y: particle.y,
            opacity: 1,
            rotate: particle.rotation
          }}
          animate={{
            y: 400,
            x: particle.x + (Math.random() - 0.5) * 50,
            opacity: 0,
            rotate: particle.rotation + 360
          }}
          transition={{
            duration: particle.duration,
            ease: "linear"
          }}
        >
          {particle.char}
        </motion.text>
      ))}
    </g>
  );
};

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
  rotation: number;
  duration: number;
}
```

### 5. Tree Controls Component

```tsx
interface TreeControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  stage: number;
}

const TreeControls: React.FC<TreeControlsProps> = ({
  isPlaying,
  onPlayPause,
  onReset,
  stage
}) => {
  return (
    <>
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <motion.button
          onClick={onPlayPause}
          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 
            border border-emerald-500/50 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-emerald-400" />
          ) : (
            <Play className="w-4 h-4 text-emerald-400" />
          )}
        </motion.button>
        
        <motion.button
          onClick={onReset}
          className="p-2 bg-slate-700/50 hover:bg-slate-700 
            border border-slate-600 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </motion.button>
      </div>
      
      {/* Stage indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((stageNum) => (
            <motion.div
              key={stageNum}
              className={`w-2 h-2 rounded-full transition-all duration-300`}
              animate={{
                backgroundColor: stage >= stageNum ? '#10b981' : '#334155',
                boxShadow: stage >= stageNum 
                  ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                  : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
```

---

## 🎬 ANIMATION TIMELINE

### Complete Animation Sequence
```typescript
const animationTimeline = {
  // Stage 1: Roots appear (0-1s)
  roots: {
    start: 0,
    duration: 1000,
    trigger: () => setAnimationStage(1),
    animations: [
      { element: 'root-center', delay: 0, duration: 800 },
      { element: 'root-left', delay: 200, duration: 800 },
      { element: 'root-right', delay: 400, duration: 800 }
    ]
  },
  
  // Stage 2: Trunk grows (1-2.5s)
  trunk: {
    start: 1000,
    duration: 1500,
    trigger: () => setAnimationStage(2),
    animations: [
      { element: 'trunk-main', delay: 0, duration: 1500, easing: 'bounce' },
      { element: 'trunk-texture', delay: 500, duration: 1000 }
    ]
  },
  
  // Stage 3: Branches spread (2.5-3.5s)
  branches: {
    start: 2500,
    duration: 1000,
    trigger: () => setAnimationStage(3),
    animations: [
      { element: 'branch-1', delay: 0, duration: 800, easing: 'elastic' },
      { element: 'branch-2', delay: 100, duration: 800, easing: 'elastic' },
      { element: 'branch-3', delay: 200, duration: 800, easing: 'elastic' },
      { element: 'branch-4', delay: 300, duration: 800, easing: 'elastic' },
      { element: 'branch-5', delay: 400, duration: 800, easing: 'elastic' },
      { element: 'branch-6', delay: 500, duration: 800, easing: 'elastic' }
    ]
  },
  
  // Stage 4: Leaves appear (3.5-5s)
  leaves: {
    start: 3500,
    duration: 1500,
    trigger: () => setAnimationStage(4),
    stagger: 100, // Delay between each leaf
    animations: 'dynamic' // Based on character count
  },
  
  // Stage 5: Continuous ambient animations (5s+)
  ambient: {
    start: 5000,
    duration: Infinity,
    trigger: () => setAnimationStage(5),
    effects: [
      'wind-sway',
      'falling-particles',
      'glow-pulse',
      'branch-sway'
    ]
  }
};
```

### Animation Orchestration Hook
```typescript
export const useTreeAnimation = (autoPlay: boolean) => {
  const [stage, setStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const timers: NodeJS.Timeout[] = [];
    
    // Stage 1: Roots (0-1s)
    timers.push(setTimeout(() => setStage(1), 0));
    
    // Stage 2: Trunk (1-2.5s)
    timers.push(setTimeout(() => setStage(2), 1000));
    
    // Stage 3: Branches (2.5-3.5s)
    timers.push(setTimeout(() => setStage(3), 2500));
    
    // Stage 4: Leaves (3.5-5s)
    timers.push(setTimeout(() => setStage(4), 3500));
    
    // Stage 5: Ambient (5s+)
    timers.push(setTimeout(() => setStage(5), 5000));
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isPlaying]);
  
  const reset = () => {
    setStage(0);
    setIsPlaying(false);
  };
  
  const replay = () => {
    setStage(0);
    setIsPlaying(true);
  };
  
  return { stage, isPlaying, setIsPlaying, reset, replay };
};
```


---

## 🎨 STYLING & CSS ANIMATIONS

### CSS for SVG Animations
```css
/* Container styling */
.svg-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #334155;
}

/* SVG responsive */
.svg-tree-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Wind sway animation for leaves */
@keyframes wind-sway {
  0%, 100% {
    transform: rotate(0deg) translateX(0);
  }
  25% {
    transform: rotate(2deg) translateX(2px);
  }
  75% {
    transform: rotate(-2deg) translateX(-2px);
  }
}

.leaf-char {
  animation: wind-sway 3s ease-in-out infinite;
  transform-origin: center;
}

/* Stagger wind animation */
.leaf-char:nth-child(2n) {
  animation-delay: 0.5s;
  animation-duration: 3.5s;
}

.leaf-char:nth-child(3n) {
  animation-delay: 1s;
  animation-duration: 2.5s;
}

/* Glow pulse animation */
@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.6));
  }
}

.tree-leaves {
  animation: glow-pulse 3s ease-in-out infinite;
}

/* Branch sway */
@keyframes branch-sway {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(1deg);
  }
}

.tree-branches path {
  animation: branch-sway 4s ease-in-out infinite;
  transform-origin: 250px 250px;
}

/* Ground line animation */
.tree-ground {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #334155 50%,
    transparent 100%
  );
  animation: ground-shimmer 3s ease-in-out infinite;
}

@keyframes ground-shimmer {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}
```

### SVG-Specific CSS Techniques

#### Stroke Animation
```css
/* Path drawing animation */
.animated-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-path 2s ease-out forwards;
}

@keyframes draw-path {
  to {
    stroke-dashoffset: 0;
  }
}
```

#### Text Animation
```css
/* Character appear animation */
.leaf-char {
  opacity: 0;
  transform: scale(0) rotate(-45deg);
  animation: leaf-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes leaf-appear {
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

/* Stagger delays */
.leaf-char:nth-child(1) { animation-delay: 0.1s; }
.leaf-char:nth-child(2) { animation-delay: 0.2s; }
.leaf-char:nth-child(3) { animation-delay: 0.3s; }
/* ... and so on */
```

---

## 📦 DEPENDENCIES

### Package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 🚀 USAGE EXAMPLE

### Integration in Edit Mahasiswa Page
```tsx
import SVGTreeAnimation from '@/components/SVGTreeAnimation';

const MahasiswaEditPage = () => {
  const student = {
    nama: "ABDUR ROSYID AMRULLAH",
    nim: "2310140412"
  };
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Profile Photo */}
      <div className="space-y-4">
        <ProfilePhotoUpload />
        
        {/* SVG Tree Animation */}
        <div className="h-[400px]">
          <SVGTreeAnimation
            studentName={student.nama}
            width={500}
            height={400}
            autoPlay={true}
            theme="emerald"
          />
        </div>
      </div>
      
      {/* Right: Form Fields */}
      <div>
        <StudentDataForm />
      </div>
    </div>
  );
};
```

### Standalone Usage
```tsx
// Simple usage
<SVGTreeAnimation studentName="JOHN DOE" />

// With custom props
<SVGTreeAnimation
  studentName="JANE SMITH"
  width={600}
  height={500}
  autoPlay={false}
  theme="autumn"
/>

// With controls
const [isPlaying, setIsPlaying] = useState(true);

<SVGTreeAnimation
  studentName="ALEX JOHNSON"
  autoPlay={isPlaying}
  onAnimationComplete={() => console.log('Animation done!')}
/>
```

---

## 🎯 ADVANCED FEATURES

### 1. Interactive Mode
```tsx
const InteractiveSVGTree: React.FC = () => {
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null);
  
  return (
    <svg viewBox="0 0 500 400">
      {/* ... tree structure ... */}
      
      {chars.map((char, index) => (
        <motion.text
          key={index}
          onClick={() => setSelectedLeaf(index)}
          className="cursor-pointer"
          whileHover={{ scale: 1.2 }}
          animate={{
            fill: selectedLeaf === index ? '#fbbf24' : leafColors[index % 4]
          }}
        >
          {char}
        </motion.text>
      ))}
    </svg>
  );
};
```

### 2. Seasonal Themes
```typescript
const seasonalThemes = {
  spring: {
    leafColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    trunkColor: '#78350f',
    effects: ['flowers', 'butterflies']
  },
  summer: {
    leafColors: ['#059669', '#10b981', '#34d399'],
    trunkColor: '#92400e',
    effects: ['bright-glow', 'birds']
  },
  autumn: {
    leafColors: ['#f59e0b', '#ef4444', '#dc2626', '#b91c1c'],
    trunkColor: '#78350f',
    effects: ['falling-leaves', 'wind-strong']
  },
  winter: {
    leafColors: ['#e0e7ff', '#c7d2fe', '#a5b4fc'],
    trunkColor: '#451a03',
    effects: ['snow', 'bare-branches']
  }
};
```

### 3. Sound Effects Integration (Optional)
```typescript
const useSoundEffects = (stage: number) => {
  useEffect(() => {
    const sounds = {
      1: '/sounds/roots-grow.mp3',
      2: '/sounds/trunk-grow.mp3',
      3: '/sounds/branches-spread.mp3',
      4: '/sounds/leaves-appear.mp3',
      5: '/sounds/wind-ambient.mp3'
    };
    
    if (sounds[stage]) {
      const audio = new Audio(sounds[stage]);
      audio.volume = 0.3;
      audio.play();
    }
  }, [stage]);
};
```

### 4. Export Functionality
```typescript
const exportSVGAsImage = (svgElement: SVGSVGElement) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = 500;
    canvas.height = 400;
    ctx?.drawImage(img, 0, 0);
    
    // Download as PNG
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'tree-animation.png';
    downloadLink.click();
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
};
```


---

## 📊 PERFORMANCE OPTIMIZATION

### SVG Performance Best Practices

#### 1. Minimize DOM Nodes
```typescript
// BAD: Too many individual elements
{chars.map(char => (
  <g>
    <circle />
    <text>{char}</text>
    <circle />
  </g>
))}

// GOOD: Combine when possible
{chars.map(char => (
  <text filter="url(#glow)">{char}</text>
))}
```

#### 2. Use CSS Transforms Instead of Attribute Animation
```css
/* GOOD: Hardware accelerated */
.leaf-char {
  transform: translateX(0);
  transition: transform 0.3s;
}

.leaf-char:hover {
  transform: translateX(5px);
}

/* AVOID: Repaints */
.leaf-char {
  x: 100;
  transition: x 0.3s;
}
```

#### 3. Reuse Definitions
```xml
<defs>
  <!-- Define once, use many times -->
  <filter id="glow">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  
  <linearGradient id="leafGradient">
    <stop offset="0%" stop-color="#10b981" />
    <stop offset="100%" stop-color="#34d399" />
  </linearGradient>
</defs>

<!-- Use multiple times -->
<text filter="url(#glow)" fill="url(#leafGradient)">A</text>
<text filter="url(#glow)" fill="url(#leafGradient)">B</text>
```

#### 4. Lazy Load Particles
```typescript
const [particlesEnabled, setParticlesEnabled] = useState(false);

useEffect(() => {
  // Only enable particles after main animation completes
  if (stage >= 5) {
    setTimeout(() => setParticlesEnabled(true), 1000);
  }
}, [stage]);
```

#### 5. Use will-change for Animated Elements
```css
.leaf-char {
  will-change: transform, opacity;
}

/* Remove after animation */
.leaf-char.animation-complete {
  will-change: auto;
}
```

### Performance Metrics Target
```typescript
const performanceTargets = {
  fps: 60,                    // Smooth animation
  initialRender: '<100ms',    // Fast first paint
  memoryUsage: '<30MB',       // Low memory footprint
  domNodes: '<200',           // Reasonable DOM size
  repaints: 'minimal',        // Avoid layout thrashing
  cpuUsage: '<20%',          // Low CPU usage
};
```

---

## 🎨 CUSTOMIZATION OPTIONS

### Theme Configuration
```typescript
interface TreeTheme {
  name: string;
  colors: {
    trunk: {
      base: string;
      highlight: string;
      shadow: string;
    };
    leaves: string[];
    background: {
      start: string;
      end: string;
    };
    glow: string;
  };
  animation: {
    speed: number;        // 0.5 - 2.0 (multiplier)
    style: 'smooth' | 'bouncy' | 'elastic';
    stagger: number;      // ms between elements
  };
  effects: {
    wind: boolean;
    particles: boolean;
    glow: boolean;
    shadows: boolean;
  };
  layout: {
    scale: number;        // 0.5 - 1.5
    density: 'sparse' | 'normal' | 'dense';
    branchCount: number;  // 4 - 8
  };
}

// Example themes
const themes: Record<string, TreeTheme> = {
  emerald: {
    name: 'Emerald Spring',
    colors: {
      trunk: { base: '#78350f', highlight: '#92400e', shadow: '#451a03' },
      leaves: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      background: { start: '#0f172a', end: '#1e293b' },
      glow: 'rgba(16, 185, 129, 0.3)'
    },
    animation: { speed: 1, style: 'bouncy', stagger: 100 },
    effects: { wind: true, particles: true, glow: true, shadows: true },
    layout: { scale: 1, density: 'normal', branchCount: 6 }
  },
  
  autumn: {
    name: 'Autumn Harvest',
    colors: {
      trunk: { base: '#78350f', highlight: '#92400e', shadow: '#451a03' },
      leaves: ['#f59e0b', '#ef4444', '#dc2626', '#b91c1c'],
      background: { start: '#1e1b4b', end: '#312e81' },
      glow: 'rgba(245, 158, 11, 0.3)'
    },
    animation: { speed: 0.8, style: 'smooth', stagger: 80 },
    effects: { wind: true, particles: true, glow: true, shadows: true },
    layout: { scale: 1, density: 'dense', branchCount: 7 }
  },
  
  winter: {
    name: 'Winter Frost',
    colors: {
      trunk: { base: '#451a03', highlight: '#78350f', shadow: '#1c0a00' },
      leaves: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8'],
      background: { start: '#0c4a6e', end: '#075985' },
      glow: 'rgba(224, 231, 255, 0.4)'
    },
    animation: { speed: 1.2, style: 'elastic', stagger: 120 },
    effects: { wind: false, particles: true, glow: true, shadows: false },
    layout: { scale: 0.9, density: 'sparse', branchCount: 5 }
  }
};
```

### Dynamic Theme Switcher
```tsx
const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('emerald');
  
  return (
    <div className="flex gap-2">
      {Object.keys(themes).map(themeName => (
        <button
          key={themeName}
          onClick={() => setCurrentTheme(themeName)}
          className={`px-3 py-1 rounded ${
            currentTheme === themeName 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {themes[themeName].name}
        </button>
      ))}
    </div>
  );
};
```

---

## 🔧 DEBUGGING & DEVELOPMENT

### SVG Debug Mode
```tsx
const SVGTreeDebug: React.FC = ({ showDebug = false }) => {
  if (!showDebug) return null;
  
  return (
    <g id="debug-layer" opacity="0.3">
      {/* Grid lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 40}
          x2="500"
          y2={i * 40}
          stroke="#666"
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 50}
          y1="0"
          x2={i * 50}
          y2="400"
          stroke="#666"
          strokeWidth="0.5"
        />
      ))}
      
      {/* Center crosshair */}
      <circle cx="250" cy="200" r="5" fill="red" />
      <text x="255" y="205" fill="red" fontSize="10">Center</text>
    </g>
  );
};
```

### Performance Monitor
```tsx
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return { fps, renderTime };
};
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Basic Structure
- [ ] Setup SVG component with viewBox
- [ ] Create tree gradients and filters
- [ ] Implement root system paths
- [ ] Implement trunk rectangle with gradient
- [ ] Create branch paths with bezier curves
- [ ] Test responsive scaling

### Phase 2: Animation System
- [ ] Setup Framer Motion integration
- [ ] Implement stroke-dasharray animations for paths
- [ ] Create scale animations for trunk
- [ ] Add stagger animations for branches
- [ ] Implement leaf appearance animations
- [ ] Test animation timeline

### Phase 3: Interactive Features
- [ ] Add play/pause controls
- [ ] Implement reset functionality
- [ ] Create stage indicator
- [ ] Add hover effects on leaves
- [ ] Implement click interactions

### Phase 4: Advanced Effects
- [ ] Implement wind sway animation
- [ ] Create falling particle system
- [ ] Add glow pulse effects
- [ ] Implement seasonal themes
- [ ] Add sound effects (optional)

### Phase 5: Optimization
- [ ] Minimize DOM nodes
- [ ] Optimize animation performance
- [ ] Add lazy loading for particles
- [ ] Implement will-change CSS
- [ ] Test on different devices

### Phase 6: Polish
- [ ] Add accessibility labels
- [ ] Implement export functionality
- [ ] Create theme switcher
- [ ] Add debug mode
- [ ] Write documentation

---

## 🎬 FINAL RESULT

Animasi pohon SVG yang:
✨ **Scalable**: Tajam di semua ukuran dan resolusi
🌿 **Smooth**: 60 FPS dengan hardware acceleration
🍂 **Interactive**: Kontrol play/pause dan reset
💚 **Themeable**: Multiple seasonal themes
🎮 **Accessible**: Screen reader friendly dengan ARIA labels
⚡ **Performant**: Optimized dengan CSS transforms
🎨 **Customizable**: Flexible theme system
📱 **Responsive**: Otomatis adapt ke container size

### Keunggulan SVG vs Canvas

| Aspect | SVG | Canvas |
|--------|-----|--------|
| Scalability | ⭐⭐⭐⭐⭐ Perfect | ⭐⭐ Pixelated |
| Performance | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Accessibility | ⭐⭐⭐⭐⭐ Native | ⭐ Manual |
| Maintainability | ⭐⭐⭐⭐⭐ Declarative | ⭐⭐⭐ Imperative |
| File Size | ⭐⭐⭐⭐ Small | ⭐⭐⭐ Medium |
| CSS Integration | ⭐⭐⭐⭐⭐ Native | ⭐ Limited |
| Inspect/Debug | ⭐⭐⭐⭐⭐ DevTools | ⭐⭐ Limited |

**Tech Stack Final:**
- React + TypeScript
- SVG (inline)
- Framer Motion (orchestration)
- CSS Animations (hardware accelerated)
- Tailwind CSS (styling)

Animasi ini memberikan pengalaman visual yang smooth, scalable, dan accessible untuk halaman edit mahasiswa! 🌳✨

