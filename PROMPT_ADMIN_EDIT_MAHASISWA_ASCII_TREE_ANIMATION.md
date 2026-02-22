# 🌳 PROMPT ULTRA ADVANCED: ASCII TREE ANIMATION FROM STUDENT NAME
## Animasi Pohon ASCII yang Tumbuh dari Huruf Nama Mahasiswa

---

## 🎯 KONSEP UTAMA

### Ide Animasi
Menggantikan foto profil kosong dengan animasi pohon ASCII yang:
1. **Dimulai dari bawah** - Huruf-huruf nama mahasiswa muncul dari bawah
2. **Membentuk batang** - Huruf-huruf tersusun vertikal membentuk batang pohon
3. **Tumbuh ke atas** - Animasi growth dari bawah ke atas
4. **Cabang muncul** - Cabang-cabang terbentuk dari huruf nama
5. **Daun bermekaran** - Huruf-huruf menyebar membentuk tajuk pohon
6. **Efek hidup** - Daun bergoyang, warna berubah, partikel jatuh

### Visual Concept
```
FASE 1: Seed (0-20%)          FASE 2: Sprout (20-40%)
                              
     (kosong)                        A
                                     |
                                     B
                              _____|_____
                              
FASE 3: Growing (40-60%)      FASE 4: Branching (60-80%)
                              
        D                            D U R
       /|\                          /|\ /|\
      U | L                        U | L | M
      | | |                        | | | | |
      A B D                        A B D U L
  ____|_|_|____                ____|_|_|_|____
                              
FASE 5: Full Tree (80-100%)
                              
         R O S Y I D
        / | | | | | \
       A  M R O S Y  I
      /|\ | | | | | /|\
     D U L A H M A D  R
     | | | | | | | |  |
     A B D U L R O S Y I D
  ___|_|_|_|_|_|_|_|_|_|___
```

---

## 🎨 DESIGN SPECIFICATIONS

### Color Scheme (Emerald Theme)
```typescript
const treeColors = {
  // Trunk (Batang)
  trunk: {
    base: '#78350f',        // Brown
    highlight: '#92400e',
    shadow: '#451a03',
  },
  
  // Leaves (Daun) - Gradient dari bawah ke atas
  leaves: {
    bottom: '#10b981',      // Emerald 500
    middle: '#34d399',      // Emerald 400
    top: '#6ee7b7',         // Emerald 300
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  
  // Ground (Tanah)
  ground: {
    base: '#1e293b',
    grass: '#059669',
  },
  
  // Particles (Efek)
  particles: {
    sparkle: '#fbbf24',     // Amber
    leaf: '#10b981',
    glow: '#34d399',
  },
  
  // Background
  background: {
    gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    stars: '#64748b',
  }
}
```

### Container Dimensions
```typescript
const dimensions = {
  width: 400,              // px
  height: 400,             // px
  aspectRatio: '1:1',
  
  tree: {
    maxHeight: 320,        // 80% of container
    maxWidth: 280,         // 70% of container
    trunkWidth: 40,
    branchSpread: 180,
  }
}
```

---

## 🔧 TECH STACK

### Core Technologies
```json
{
  "framework": "React 18+ with TypeScript",
  "animation": "framer-motion ^10.x",
  "canvas": "react-konva ^18.x OR HTML5 Canvas",
  "ascii": "figlet.js ^1.x (optional)",
  "utilities": {
    "lodash": "^4.x",
    "gsap": "^3.x (alternative animation)",
    "three.js": "^0.x (optional 3D effect)"
  }
}
```

### Recommended Stack
**Option 1: Pure React + Framer Motion** (Recommended)
- Lightweight
- Easy to maintain
- Smooth animations
- Good performance

**Option 2: React + Canvas (HTML5)**
- Better for complex ASCII rendering
- More control over pixels
- Can handle more particles

**Option 3: React + Konva**
- Best for interactive elements
- Layer management
- Event handling

---

## 📦 COMPONENT STRUCTURE

```typescript
// Main Component
<ASCIITreeAnimation>
  <TreeContainer>
    <BackgroundLayer>
      <Stars />
      <Gradient />
    </BackgroundLayer>
    
    <GroundLayer>
      <Grass />
      <Soil />
    </GroundLayer>
    
    <TreeLayer>
      <Trunk characters={trunkChars} />
      <Branches characters={branchChars} />
      <Leaves characters={leafChars} />
    </TreeLayer>
    
    <ParticleLayer>
      <FallingLeaves />
      <Sparkles />
      <GlowEffects />
    </ParticleLayer>
    
    <OverlayLayer>
      <StudentName />
      <AnimationControls />
    </OverlayLayer>
  </TreeContainer>
</ASCIITreeAnimation>
```

---

## 💻 IMPLEMENTATION DETAILS

### 1. Character Distribution Algorithm

```typescript
interface CharacterNode {
  char: string;
  x: number;
  y: number;
  delay: number;
  type: 'trunk' | 'branch' | 'leaf';
  color: string;
  size: number;
}

function distributeCharacters(name: string): CharacterNode[] {
  const chars = name.toUpperCase().replace(/\s/g, '').split('');
  const nodes: CharacterNode[] = [];
  
  // 1. TRUNK - 30% karakter (vertikal di tengah)
  const trunkCount = Math.ceil(chars.length * 0.3);
  const trunkChars = chars.slice(0, trunkCount);
  
  trunkChars.forEach((char, i) => {
    nodes.push({
      char,
      x: 200, // center
      y: 350 - (i * 25), // dari bawah ke atas
      delay: i * 100, // stagger
      type: 'trunk',
      color: treeColors.trunk.base,
      size: 24,
    });
  });
  
  // 2. BRANCHES - 30% karakter (diagonal dari trunk)
  const branchCount = Math.ceil(chars.length * 0.3);
  const branchChars = chars.slice(trunkCount, trunkCount + branchCount);
  const trunkTop = 350 - (trunkCount * 25);
  
  branchChars.forEach((char, i) => {
    const side = i % 2 === 0 ? -1 : 1; // alternating sides
    const angle = (i + 1) * 15; // increasing angle
    
    nodes.push({
      char,
      x: 200 + (side * angle * 2),
      y: trunkTop - (i * 15),
      delay: (trunkCount + i) * 100,
      type: 'branch',
      color: treeColors.trunk.highlight,
      size: 20,
    });
  });
  
  // 3. LEAVES - 40% karakter (spread di atas)
  const leafChars = chars.slice(trunkCount + branchCount);
  const canopyCenter = { x: 200, y: trunkTop - (branchCount * 15) };
  
  leafChars.forEach((char, i) => {
    // Circular distribution
    const angle = (i / leafChars.length) * Math.PI * 2;
    const radius = 60 + Math.random() * 40;
    
    nodes.push({
      char,
      x: canopyCenter.x + Math.cos(angle) * radius,
      y: canopyCenter.y - Math.sin(angle) * radius * 0.5, // ellipse
      delay: (trunkCount + branchCount + i) * 80,
      type: 'leaf',
      color: treeColors.leaves.middle,
      size: 18,
    });
  });
  
  return nodes;
}
```

### 2. Growth Animation Timeline

```typescript
const animationTimeline = {
  // Phase 1: Seed appears (0-10%)
  seed: {
    duration: 500,
    effect: 'fade-in + scale-up',
    element: 'small dot at bottom',
  },
  
  // Phase 2: Trunk grows (10-40%)
  trunk: {
    duration: 1500,
    effect: 'characters appear bottom-to-top',
    stagger: 100,
    easing: 'easeOutCubic',
  },
  
  // Phase 3: Branches spread (40-65%)
  branches: {
    duration: 1200,
    effect: 'characters slide from trunk',
    stagger: 80,
    easing: 'easeOutBack',
  },
  
  // Phase 4: Leaves bloom (65-90%)
  leaves: {
    duration: 1500,
    effect: 'characters scatter + rotate',
    stagger: 60,
    easing: 'easeOutElastic',
  },
  
  // Phase 5: Idle animation (90-100%)
  idle: {
    duration: 'infinite',
    effects: [
      'leaves-sway',
      'trunk-breathe',
      'particles-fall',
      'glow-pulse',
    ],
  },
};
```

### 3. Framer Motion Implementation

```tsx
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ASCIITreeProps {
  studentName: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export const ASCIITreeAnimation: React.FC<ASCIITreeProps> = ({
  studentName,
  autoPlay = true,
  loop = false,
}) => {
  const [nodes, setNodes] = useState<CharacterNode[]>([]);
  const [phase, setPhase] = useState<'seed' | 'growing' | 'idle'>('seed');
  
  useEffect(() => {
    const distributed = distributeCharacters(studentName);
    setNodes(distributed);
    
    if (autoPlay) {
      startAnimation();
    }
  }, [studentName]);
  
  const startAnimation = async () => {
    setPhase('growing');
    // Animation will be handled by framer-motion variants
    
    // After all animations complete
    setTimeout(() => {
      setPhase('idle');
    }, 4700); // total duration
  };
  
  return (
    <div className="relative w-[400px] h-[400px] bg-gradient-to-b 
      from-slate-900 to-slate-800 rounded-2xl overflow-hidden">
      
      {/* Background Stars */}
      <BackgroundStars />
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 
        bg-gradient-to-t from-slate-800 to-transparent">
        <GrassEffect />
      </div>
      
      {/* Tree Characters */}
      <div className="absolute inset-0 flex items-center justify-center">
        {nodes.map((node, index) => (
          <CharacterNode
            key={`${node.char}-${index}`}
            node={node}
            phase={phase}
          />
        ))}
      </div>
      
      {/* Particles */}
      {phase === 'idle' && <ParticleSystem />}
      
      {/* Student Name Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.5, duration: 0.8 }}
        className="absolute bottom-6 left-0 right-0 text-center"
      >
        <p className="text-emerald-400 font-semibold text-lg tracking-wide">
          {studentName}
        </p>
      </motion.div>
      
      {/* Replay Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'idle' ? 1 : 0 }}
        onClick={startAnimation}
        className="absolute top-4 right-4 p-2 bg-emerald-500/20 
          hover:bg-emerald-500/30 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4 text-emerald-400" />
      </motion.button>
    </div>
  );
};
```

### 4. Character Node Component

```tsx
interface CharacterNodeProps {
  node: CharacterNode;
  phase: 'seed' | 'growing' | 'idle';
}

const CharacterNode: React.FC<CharacterNodeProps> = ({ node, phase }) => {
  // Animation variants based on node type
  const variants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: 50,
    },
    
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: node.delay / 1000,
        duration: 0.6,
        ease: node.type === 'leaf' ? 'easeOutElastic' : 'easeOutCubic',
      },
    },
    
    idle: {
      // Different idle animations based on type
      ...(node.type === 'leaf' && {
        y: [0, -5, 0],
        rotate: [-2, 2, -2],
        transition: {
          duration: 2 + Math.random(),
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }),
      
      ...(node.type === 'trunk' && {
        scale: [1, 1.02, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }),
    },
  };
  
  // Color animation for leaves
  const leafColorCycle = {
    color: [
      treeColors.leaves.bottom,
      treeColors.leaves.middle,
      treeColors.leaves.top,
      treeColors.leaves.middle,
      treeColors.leaves.bottom,
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'linear',
    },
  };
  
  return (
    <motion.div
      initial="hidden"
      animate={phase === 'growing' ? 'visible' : phase === 'idle' ? 'idle' : 'hidden'}
      variants={variants}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        fontSize: node.size,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: node.color,
        textShadow: node.type === 'leaf' 
          ? `0 0 10px ${treeColors.leaves.glow}` 
          : 'none',
        zIndex: node.type === 'leaf' ? 3 : node.type === 'branch' ? 2 : 1,
      }}
    >
      <motion.span
        animate={node.type === 'leaf' && phase === 'idle' ? leafColorCycle : {}}
      >
        {node.char}
      </motion.span>
      
      {/* Glow effect for leaves */}
      {node.type === 'leaf' && phase === 'idle' && (
        <motion.div
          className="absolute inset-0 blur-md"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            color: treeColors.leaves.glow,
          }}
        >
          {node.char}
        </motion.div>
      )}
    </motion.div>
  );
};
```

### 5. Background Stars Component

```tsx
const BackgroundStars: React.FC = () => {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60, // upper 60% only
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));
  
  return (
    <div className="absolute inset-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-slate-400"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
```

### 6. Particle System (Falling Leaves)

```tsx
const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now(),
        x: 150 + Math.random() * 100,
        y: 100,
        char: ['*', '•', '◆', '◇'][Math.floor(Math.random() * 4)],
        rotation: Math.random() * 360,
        duration: 3 + Math.random() * 2,
      };
      
      setParticles((prev) => [...prev, newParticle]);
      
      // Remove after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-emerald-400/60 text-sm"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 1,
            rotate: particle.rotation,
          }}
          animate={{
            y: 400,
            x: particle.x + (Math.random() - 0.5) * 50,
            opacity: 0,
            rotate: particle.rotation + 360,
          }}
          transition={{
            duration: particle.duration,
            ease: 'linear',
          }}
        >
          {particle.char}
        </motion.div>
      ))}
    </>
  );
};
```

### 7. Grass Effect

```tsx
const GrassEffect: React.FC = () => {
  const grassBlades = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (i / 20) * 100,
    height: 10 + Math.random() * 10,
    delay: Math.random() * 2,
  }));
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end">
      {grassBlades.map((blade) => (
        <motion.div
          key={blade.id}
          className="flex-1"
          style={{
            height: blade.height,
            background: 'linear-gradient(to top, #059669, transparent)',
          }}
          animate={{
            scaleY: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 1.5 + blade.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
```

---

## 🎬 ANIMATION SEQUENCE

### Timeline Breakdown
```typescript
const timeline = {
  0: 'Container fade in',
  500: 'Seed appears at bottom',
  1000: 'First trunk character appears',
  1100: 'Second trunk character',
  // ... stagger continues
  2500: 'Trunk complete',
  2600: 'First branch character slides out',
  // ... branches grow
  3800: 'Branches complete',
  3900: 'First leaf appears',
  // ... leaves scatter
  5400: 'Tree complete',
  5500: 'Idle animations begin',
  5500: 'Particles start falling',
  6000: 'Student name fades in',
};
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Best Practices
```typescript
// 1. Memoize character nodes
const memoizedNodes = useMemo(
  () => distributeCharacters(studentName),
  [studentName]
);

// 2. Use CSS transforms (GPU accelerated)
// ✅ Good
transform: 'translateY(10px) scale(1.1)'

// ❌ Avoid
top: '10px', width: '110%'

// 3. Limit particle count
const MAX_PARTICLES = 15;

// 4. Use will-change for animated elements
style={{ willChange: 'transform, opacity' }}

// 5. Debounce resize events
const debouncedResize = debounce(handleResize, 200);
```

---

## 🎮 INTERACTIVE FEATURES

### User Controls
```tsx
<div className="absolute top-4 left-4 flex gap-2">
  {/* Play/Pause */}
  <button onClick={toggleAnimation}>
    {isPlaying ? <Pause /> : <Play />}
  </button>
  
  {/* Speed Control */}
  <select onChange={(e) => setSpeed(Number(e.target.value))}>
    <option value="0.5">0.5x</option>
    <option value="1">1x</option>
    <option value="2">2x</option>
  </select>
  
  {/* Replay */}
  <button onClick={replay}>
    <RotateCcw />
  </button>
</div>
```

---

## 📱 RESPONSIVE DESIGN

```typescript
const responsiveSizes = {
  mobile: {
    width: 280,
    height: 280,
    fontSize: { trunk: 18, branch: 16, leaf: 14 },
  },
  tablet: {
    width: 350,
    height: 350,
    fontSize: { trunk: 20, branch: 18, leaf: 16 },
  },
  desktop: {
    width: 400,
    height: 400,
    fontSize: { trunk: 24, branch: 20, leaf: 18 },
  },
};
```

---

## 🔍 EDGE CASES

### Handling Different Name Lengths
```typescript
function handleNameLength(name: string) {
  const charCount = name.replace(/\s/g, '').length;
  
  if (charCount < 5) {
    // Repeat characters or add decorative elements
    return name + name;
  } else if (charCount > 30) {
    // Truncate or use smaller font
    return name.slice(0, 30);
  }
  
  return name;
}
```

### Special Characters
```typescript
function sanitizeName(name: string): string {
  // Keep only letters, numbers, and spaces
  return name.replace(/[^a-zA-Z0-9\s]/g, '');
}
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🚀 USAGE EXAMPLE

```tsx
// In mahasiswa-edit.tsx
import { ASCIITreeAnimation } from '@/components/ASCIITreeAnimation';

// Replace empty profile picture with:
{!student.foto ? (
  <ASCIITreeAnimation
    studentName={student.nama}
    autoPlay={true}
    loop={false}
  />
) : (
  <img src={student.foto} alt={student.nama} />
)}
```

---

## 🎨 ALTERNATIVE STYLES

### Style 1: Minimalist
- Monochrome (white/gray)
- No particles
- Simple sway animation

### Style 2: Colorful
- Rainbow gradient leaves
- More particles
- Sparkle effects

### Style 3: Seasonal
- Spring: Pink blossoms
- Summer: Green leaves
- Autumn: Orange/red leaves
- Winter: Snow particles

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Setup framer-motion
- [ ] Create character distribution algorithm
- [ ] Implement CharacterNode component
- [ ] Add growth animation timeline
- [ ] Create background effects (stars, ground)
- [ ] Add particle system
- [ ] Implement idle animations
- [ ] Add user controls
- [ ] Optimize performance
- [ ] Test with different name lengths
- [ ] Add responsive design
- [ ] Polish and fine-tune

---

## 🎯 FINAL RESULT

Animasi pohon ASCII yang:
✨ Tumbuh organik dari nama mahasiswa
🌳 Smooth dan natural
🎨 Warna emerald theme konsisten
⚡ Performa optimal
🎮 Interactive dan engaging
📱 Responsive di semua device

**Estimasi Development Time**: 6-8 jam
**Complexity Level**: Medium-High
**Performance Impact**: Low (GPU accelerated)
