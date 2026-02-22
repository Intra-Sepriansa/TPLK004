# 🌳 PROMPT ULTRA ADVANCED: ASCII TREE ANIMATION FROM STUDENT NAME
## Animasi Pohon ASCII yang Tumbuh dari Huruf Nama Mahasiswa

---

## 📋 OVERVIEW KONSEP

### Ide Utama
Membuat animasi pohon ASCII yang **tumbuh secara organik** dari bawah ke atas menggunakan huruf-huruf dari nama mahasiswa. Pohon ini akan:
- Dimulai dari akar yang muncul dari bawah
- Batang tumbuh ke atas dengan animasi smooth
- Cabang-cabang menyebar ke samping
- Daun-daun bermunculan dari huruf nama mahasiswa
- Efek angin yang membuat daun bergoyang
- Partikel jatuh seperti daun gugur

### Penempatan
Area kosong di sebelah foto profil pada halaman Edit Mahasiswa (seperti dashboard admin)

### Dimensi Canvas
```
Width: 500px - 600px
Height: 400px - 500px
Aspect Ratio: 4:3 atau 5:4
```

---

## 🎨 VISUAL DESIGN

### Color Scheme (Emerald Theme)
```typescript
const treeColors = {
  trunk: {
    base: '#78350f',        // Brown dark
    highlight: '#92400e',   // Brown medium
    shadow: '#451a03',      // Brown darker
  },
  leaves: {
    primary: '#10b981',     // Emerald 500
    secondary: '#34d399',   // Emerald 400
    tertiary: '#6ee7b7',    // Emerald 300
    accent: '#a7f3d0',      // Emerald 200
  },
  background: {
    sky: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    ground: '#334155',
  },
  glow: {
    emerald: 'rgba(16, 185, 129, 0.3)',
    amber: 'rgba(251, 191, 36, 0.2)',
  }
}
```

---

## 🌲 ASCII TREE STRUCTURE

### Stage 1: Akar (0-1 detik)
```
Animasi akar muncul dari bawah tanah:

         |
        /|\
       / | \
      /  |  \
```

### Stage 2: Batang Tumbuh (1-2 detik)
```
Batang tumbuh ke atas dengan efek typing:

         |
         |
        |||
        |||
        |||
       /|||\
      / ||| \
```

### Stage 3: Cabang Menyebar (2-3 detik)
```
Cabang-cabang muncul ke samping:

       \ | /
        \|/
      ---|||---
        |||
        |||
       /|||\
```

### Stage 4: Daun Bermunculan (3-5 detik)
```
Huruf-huruf nama mahasiswa menjadi daun:

    A   R   I
   B D U L   M
  R O S Y I D
    \ | /
     \|/
   ---|||---
     |||
    /|||\
```

### Stage 5: Pohon Lengkap dengan Animasi
```
Pohon penuh dengan efek angin dan partikel:

      *A*  *R*  *I*
    *B* *D* *U* *L*
   *R* *O* *S* *Y* *I*
      *D*  *M*  *A*
        \ | /
         \|/
      ---|||---
        |||
       /|||\
    ~~~~~~~~~~~
```

---

## 🎯 TECHNICAL IMPLEMENTATION

### Tech Stack Recommendation

#### Option 1: Canvas API (Recommended)
```typescript
// Paling cocok untuk animasi ASCII yang kompleks
{
  core: 'HTML5 Canvas',
  animation: 'requestAnimationFrame',
  rendering: 'CanvasRenderingContext2D',
  performance: '⭐⭐⭐⭐⭐',
  flexibility: '⭐⭐⭐⭐⭐'
}
```

#### Option 2: React + Framer Motion
```typescript
// Bagus untuk animasi deklaratif
{
  core: 'React',
  animation: 'framer-motion',
  rendering: 'DOM',
  performance: '⭐⭐⭐⭐',
  flexibility: '⭐⭐⭐⭐'
}
```

#### Option 3: Three.js (Advanced)
```typescript
// Untuk efek 3D yang lebih advanced
{
  core: 'Three.js',
  animation: 'GSAP',
  rendering: 'WebGL',
  performance: '⭐⭐⭐⭐⭐',
  flexibility: '⭐⭐⭐⭐⭐',
  complexity: 'High'
}
```

### Recommended: Canvas API + Framer Motion Hybrid

---

## 💻 IMPLEMENTATION CODE

### 1. Component Structure
```tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ASCIITreeProps {
  studentName: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
}

const ASCIITreeAnimation: React.FC<ASCIITreeProps> = ({
  studentName,
  width = 500,
  height = 400,
  autoPlay = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationStage, setAnimationStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 
      rounded-xl overflow-hidden border border-slate-700">
      {/* Canvas untuk ASCII Tree */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      
      {/* Overlay Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 
            border border-emerald-500/50 rounded-lg transition-all"
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button
          onClick={resetAnimation}
          className="p-2 bg-slate-700/50 hover:bg-slate-700 
            border border-slate-600 rounded-lg transition-all"
        >
          <RotateCcw />
        </button>
      </div>
      
      {/* Stage Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div
              key={stage}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                animationStage >= stage
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. ASCII Tree Generator Class
```typescript
class ASCIITreeGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private studentName: string;
  private nameChars: string[];
  private treeStructure: TreeNode[];
  
  constructor(canvas: HTMLCanvasElement, studentName: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.studentName = studentName.toUpperCase().replace(/\s/g, '');
    this.nameChars = this.studentName.split('');
    this.treeStructure = [];
    
    this.setupCanvas();
  }
  
  private setupCanvas() {
    // Set canvas properties
    this.ctx.font = '16px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }
  
  // Generate tree structure from name
  generateTreeStructure() {
    const centerX = this.canvas.width / 2;
    const groundY = this.canvas.height - 50;
    
    // Root system
    this.treeStructure.push({
      type: 'root',
      x: centerX,
      y: groundY,
      char: '|',
      delay: 0
    });
    
    // Trunk
    const trunkHeight = 150;
    for (let i = 0; i < trunkHeight; i += 20) {
      this.treeStructure.push({
        type: 'trunk',
        x: centerX,
        y: groundY - i,
        char: '|',
        delay: 100 + i * 10
      });
    }
    
    // Branches and leaves
    this.generateBranches(centerX, groundY - trunkHeight);
  }
  
  private generateBranches(centerX: number, startY: number) {
    const branchLevels = 5;
    const branchSpread = 80;
    let charIndex = 0;
    
    for (let level = 0; level < branchLevels; level++) {
      const y = startY - (level * 40);
      const spread = branchSpread - (level * 10);
      const charsInLevel = Math.min(
        Math.floor(spread / 30),
        this.nameChars.length - charIndex
      );
      
      for (let i = 0; i < charsInLevel; i++) {
        if (charIndex >= this.nameChars.length) break;
        
        const x = centerX - spread/2 + (i * (spread / charsInLevel));
        
        this.treeStructure.push({
          type: 'leaf',
          x: x,
          y: y,
          char: this.nameChars[charIndex],
          delay: 2000 + (level * 200) + (i * 100),
          color: this.getLeafColor(charIndex)
        });
        
        charIndex++;
      }
    }
  }
  
  private getLeafColor(index: number): string {
    const colors = [
      '#10b981', // emerald-500
      '#34d399', // emerald-400
      '#6ee7b7', // emerald-300
      '#a7f3d0', // emerald-200
    ];
    return colors[index % colors.length];
  }
  
  // Animate tree growth
  async animate() {
    for (const node of this.treeStructure) {
      await this.delay(node.delay);
      this.drawNode(node);
    }
    
    // Start wind animation
    this.startWindAnimation();
  }
  
  private drawNode(node: TreeNode) {
    this.ctx.save();
    
    // Glow effect for leaves
    if (node.type === 'leaf') {
      this.ctx.shadowColor = node.color || '#10b981';
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = node.color || '#10b981';
    } else {
      this.ctx.fillStyle = '#78350f'; // Brown for trunk
    }
    
    // Draw character with animation
    this.ctx.globalAlpha = 0;
    const fadeIn = setInterval(() => {
      this.ctx.globalAlpha += 0.1;
      this.ctx.fillText(node.char, node.x, node.y);
      
      if (this.ctx.globalAlpha >= 1) {
        clearInterval(fadeIn);
      }
    }, 50);
    
    this.ctx.restore();
  }
  
  private startWindAnimation() {
    const leaves = this.treeStructure.filter(n => n.type === 'leaf');
    
    setInterval(() => {
      leaves.forEach((leaf, index) => {
        // Sway animation
        const sway = Math.sin(Date.now() / 1000 + index) * 3;
        const originalX = leaf.x;
        
        this.ctx.clearRect(originalX - 10, leaf.y - 10, 20, 20);
        this.ctx.fillStyle = leaf.color || '#10b981';
        this.ctx.fillText(leaf.char, originalX + sway, leaf.y);
      });
    }, 50);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface TreeNode {
  type: 'root' | 'trunk' | 'branch' | 'leaf';
  x: number;
  y: number;
  char: string;
  delay: number;
  color?: string;
}
```

### 3. Hook untuk ASCII Tree
```typescript
import { useEffect, useRef } from 'react';

export const useASCIITree = (
  studentName: string,
  autoPlay: boolean = true
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeGeneratorRef = useRef<ASCIITreeGenerator | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !studentName) return;
    
    // Initialize tree generator
    treeGeneratorRef.current = new ASCIITreeGenerator(
      canvasRef.current,
      studentName
    );
    
    // Generate structure
    treeGeneratorRef.current.generateTreeStructure();
    
    // Start animation if autoPlay
    if (autoPlay) {
      treeGeneratorRef.current.animate();
    }
    
    return () => {
      // Cleanup
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [studentName, autoPlay]);
  
  const replay = () => {
    if (treeGeneratorRef.current) {
      treeGeneratorRef.current.animate();
    }
  };
  
  const pause = () => {
    // Pause animation logic
  };
  
  return {
    canvasRef,
    replay,
    pause
  };
};
```

### 4. Advanced Features

#### A. Particle System untuk Daun Jatuh
```typescript
class ParticleSystem {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  addParticle(x: number, y: number, char: string, color: string) {
    this.particles.push({
      x,
      y,
      char,
      color,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2 + 1
      },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      alpha: 1,
      life: 100
    });
  }
  
  update() {
    this.particles = this.particles.filter(p => {
      // Update position
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.rotation += p.rotationSpeed;
      
      // Fade out
      p.alpha -= 0.01;
      p.life--;
      
      // Draw particle
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillText(p.char, 0, 0);
      this.ctx.restore();
      
      return p.life > 0;
    });
  }
  
  // Randomly drop leaves
  randomDrop(leaves: TreeNode[]) {
    if (Math.random() < 0.02) { // 2% chance per frame
      const leaf = leaves[Math.floor(Math.random() * leaves.length)];
      this.addParticle(leaf.x, leaf.y, leaf.char, leaf.color!);
    }
  }
}

interface Particle {
  x: number;
  y: number;
  char: string;
  color: string;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  life: number;
}
```

#### B. Wind Effect System
```typescript
class WindEffect {
  private strength: number = 0;
  private direction: number = 0;
  private targetStrength: number = 0;
  
  update() {
    // Smooth transition to target
    this.strength += (this.targetStrength - this.strength) * 0.05;
    
    // Random wind gusts
    if (Math.random() < 0.01) {
      this.targetStrength = Math.random() * 5;
      this.direction = Math.random() * Math.PI * 2;
    }
    
    // Calm down
    this.targetStrength *= 0.95;
  }
  
  getOffset(x: number, y: number, time: number): { x: number; y: number } {
    const wave = Math.sin(time / 1000 + x / 50) * this.strength;
    return {
      x: Math.cos(this.direction) * wave,
      y: Math.sin(this.direction) * wave * 0.5
    };
  }
}
```

#### C. Growth Animation Easing
```typescript
const easings = {
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
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
    easing: 'easeOutElastic',
    elements: ['root-left', 'root-center', 'root-right']
  },
  
  // Stage 2: Trunk grows (1-2.5s)
  trunk: {
    start: 1000,
    duration: 1500,
    easing: 'easeOutBounce',
    elements: ['trunk-segments']
  },
  
  // Stage 3: Branches spread (2.5-3.5s)
  branches: {
    start: 2500,
    duration: 1000,
    easing: 'easeOutElastic',
    elements: ['branch-left', 'branch-right']
  },
  
  // Stage 4: Leaves appear (3.5-5s)
  leaves: {
    start: 3500,
    duration: 1500,
    easing: 'easeOutBounce',
    stagger: 100, // Delay between each leaf
    elements: 'name-characters'
  },
  
  // Stage 5: Continuous animations (5s+)
  ambient: {
    start: 5000,
    duration: Infinity,
    effects: ['wind', 'particles', 'glow-pulse']
  }
};
```

---

## 🎨 STYLING & EFFECTS

### CSS for Container
```css
.ascii-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #334155;
}

.ascii-tree-canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Glow effect overlay */
.ascii-tree-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 60%,
    rgba(16, 185, 129, 0.1) 0%,
    transparent 70%
  );
  pointer-events: none;
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Ground line */
.ascii-tree-ground {
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
}
```

---

## 📦 DEPENDENCIES

### Package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🚀 USAGE EXAMPLE

### Integration in Edit Mahasiswa Page
```tsx
import ASCIITreeAnimation from '@/components/ASCIITreeAnimation';

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
        
        {/* ASCII Tree Animation */}
        <div className="h-[400px]">
          <ASCIITreeAnimation
            studentName={student.nama}
            width={500}
            height={400}
            autoPlay={true}
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

---

## 🎯 ADVANCED FEATURES

### 1. Interactive Mode
- Click pada daun untuk highlight
- Hover untuk show tooltip dengan info
- Drag untuk shake tree

### 2. Seasonal Themes
- Spring: Green leaves, flowers
- Summer: Full green, bright
- Autumn: Orange/red leaves, falling
- Winter: Bare branches, snow

### 3. Sound Effects (Optional)
- Rustling leaves sound
- Wind whoosh
- Growth sound effects

### 4. Export Options
- Save as GIF
- Save as video
- Share animation

---

## 📊 PERFORMANCE OPTIMIZATION

### Tips
1. Use `requestAnimationFrame` untuk smooth animation
2. Limit particle count (max 50)
3. Use canvas layering untuk static/dynamic elements
4. Implement object pooling untuk particles
5. Debounce resize events

### Target Performance
- 60 FPS animation
- < 100ms initial render
- < 50MB memory usage

---

## 🎨 CUSTOMIZATION OPTIONS

```typescript
interface TreeCustomization {
  colors: {
    trunk: string;
    leaves: string[];
    background: string;
  };
  animation: {
    speed: number; // 0.5 - 2.0
    style: 'smooth' | 'bouncy' | 'elastic';
  };
  effects: {
    wind: boolean;
    particles: boolean;
    glow: boolean;
  };
  size: {
    scale: number; // 0.5 - 1.5
    density: 'sparse' | 'normal' | 'dense';
  };
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Setup Canvas component
- [ ] Implement ASCIITreeGenerator class
- [ ] Create animation timeline
- [ ] Add particle system
- [ ] Implement wind effects
- [ ] Add interactive controls
- [ ] Optimize performance
- [ ] Add sound effects (optional)
- [ ] Test with different names
- [ ] Add export functionality

---

## 🎬 FINAL RESULT

Animasi pohon ASCII yang:
✨ Tumbuh secara organik dari nama mahasiswa
🌿 Daun bergoyang dengan efek angin
🍂 Partikel daun jatuh secara random
💚 Glow effect dengan warna emerald theme
🎮 Interactive dan dapat di-control
⚡ Smooth 60 FPS animation
🎨 Customizable colors dan effects

**Tech Stack Final:**
- React + TypeScript
- HTML5 Canvas API
- Framer Motion (untuk UI controls)
- RequestAnimationFrame (untuk smooth animation)
- Custom particle system
- Custom physics engine untuk wind

Animasi ini akan memberikan sentuhan unik dan personal pada halaman edit mahasiswa! 🌳✨
