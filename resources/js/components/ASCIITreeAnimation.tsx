import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ASCIITreeProps {
    studentName: string;
    autoPlay?: boolean;
}

interface CharNode {
    x: number;
    y: number;
    char: string;
    type: 'leaf' | 'trunk';
    color: string;
    delay: number;
    baseAlpha: number;
    font: string;
}

interface Particle {
    x: number;
    y: number;
    char: string;
    color: string;
    vx: number;
    vy: number;
    r: number;
    vr: number;
    life: number;
    maxLife: number;
    font: string;
}

class DenseASCIITree {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private studentName: string;
    private charPool: string;
    public nodes: CharNode[] = [];
    public particles: Particle[] = [];
    private animationTime: number = 0;
    private lastFrameTime: number = 0;
    private isPlaying: boolean = false;
    private rafId: number = 0;
    private logicalWidth: number;
    private logicalHeight: number;

    constructor(canvas: HTMLCanvasElement, studentName: string, logicalWidth: number, logicalHeight: number) {
        this.canvas = canvas;
        const context = canvas.getContext('2d', { alpha: true });
        if (!context) throw new Error("No 2D context");
        this.ctx = context;
        this.logicalWidth = logicalWidth;
        this.logicalHeight = logicalHeight;

        this.studentName = studentName.toUpperCase().replace(/\s+/g, '');
        if (!this.studentName || this.studentName.length < 2) {
            this.studentName = "MAHASISWA";
        }
        // Matrix style binary + name
        this.charPool = "01" + this.studentName;
    }

    private inCanopy(x: number, y: number, cx: number, cy: number, w: number, h: number) {
        // Perfect spherical/oval canopy for a neat ASCII shape
        const rx = Math.min(w, h) * 0.4;
        const ry = Math.min(w, h) * 0.35;
        // Move the canopy slightly up so trunk has space
        const dist = Math.pow(x - cx, 2) / Math.pow(rx, 2) + Math.pow(y - cy, 2) / Math.pow(ry, 2);
        return dist <= 1;
    }

    private inTrunk(x: number, y: number, cx: number, cy: number, w: number, h: number) {
        // Straight clean trunk
        const trunkTop = cy + h * 0.1;
        const trunkBottom = h - 25;
        const trunkWidth = 35; // clean fixed width

        if (y >= trunkTop && y <= trunkBottom) {
            if (Math.abs(x - cx) <= trunkWidth / 2) return true;
        }

        // Solid root base that flares at the bottom
        if (y > trunkBottom && y <= h - 10) {
            const rootWidth = trunkWidth + (y - trunkBottom) * 2;
            if (Math.abs(x - cx) <= rootWidth / 2) return true;
        }

        return false;
    }

    public generate() {
        this.nodes = [];
        this.particles = [];
        const w = this.logicalWidth;
        const h = this.logicalHeight;

        // Grid-based generation ensures perfectly aligned monospaced characters
        // This avoids overlapping artifacts and increases smoothness.
        const charW = 11;
        const charH = 14;

        const cols = Math.floor(w / charW);
        const rows = Math.floor(h / charH);

        const cx = w / 2;
        const cy = h * 0.4; // shift tree center slightly lower to accommodate oval canopy

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * charW + charW / 2;
                const y = r * charH + charH / 2;

                const isTrunkNode = this.inTrunk(x, y, cx, cy, w, h);
                const isCanopyNode = !isTrunkNode && this.inCanopy(x, y, cx, cy, w, h);

                if (isTrunkNode || isCanopyNode) {
                    const char = this.charPool[Math.floor(Math.random() * this.charPool.length)];

                    let color: string;
                    let baseAlpha: number;
                    let font: string = '12px "Courier New", monospace';

                    // Monochromatic Emerald Theme
                    if (isTrunkNode) {
                        color = '#10b981'; // emerald-500
                        baseAlpha = 0.5; // lower alpha so canopy stands out more
                    } else {
                        // Canopy gradient based on distance from center
                        const rx = Math.min(w, h) * 0.4;
                        const ry = Math.min(w, h) * 0.35;
                        const edgeFactor = Math.sqrt(Math.pow(x - cx, 2) / Math.pow(rx, 2) + Math.pow(y - cy, 2) / Math.pow(ry, 2));

                        color = '#34d399'; // emerald-400
                        // Edges fade out smoothly
                        baseAlpha = 0.9 * Math.max(0, 1 - Math.pow(edgeFactor, 3));

                        // Highlights in pure white or bright emerald
                        if (Math.random() < 0.04) {
                            color = '#ffffff';
                            baseAlpha = 0.9;
                            font = 'bold 12px "Courier New", monospace';
                        }
                    }

                    // Bottom-up flow propagation
                    const bottomDistance = h - y;
                    const normalizedBottom = Math.max(0, Math.min(1, bottomDistance / h));
                    const delay = normalizedBottom * 1200 + Math.random() * 200;

                    this.nodes.push({
                        x, y, char, type: isTrunkNode ? 'trunk' : 'leaf', color, delay, baseAlpha, font
                    });
                }
            }
        }
    }

    public start() {
        this.generate();
        this.animationTime = 0;
        this.lastFrameTime = performance.now();
        this.isPlaying = true;
        this.renderLoop();
    }

    public stop() {
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    private renderLoop = () => {
        if (!this.isPlaying) return;

        const now = performance.now();
        // Cap dt to prevent massive jumps if tab was inactive
        const dt = Math.min(now - this.lastFrameTime, 100);
        this.lastFrameTime = now;
        this.animationTime += dt;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const h = this.logicalHeight;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Direct flat iteration is very fast
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const timeActive = this.animationTime - node.delay;

            if (timeActive > 0) {
                let progress = Math.min(1, timeActive / 1000);

                let dx = node.x;
                let dy = node.y;

                // Matrix-style character switching logic
                // Canopy characters shift frequently, trunk rarely
                const shiftChance = node.type === 'leaf' ? 0.05 : 0.005;
                if (Math.random() < shiftChance) {
                    node.char = this.charPool[Math.floor(Math.random() * this.charPool.length)];
                }

                // Smooth organic wind sway without scale jumping
                if (node.type === 'leaf' && timeActive > 1000) {
                    const heightFactor = Math.max(0, (h - dy) / h);
                    const windTime = this.animationTime / 1500;
                    // Subpixel floating drift translation mapping
                    const swayX = Math.sin(windTime + dy / 100 + dx / 100) * (heightFactor * 5);
                    dx += swayX;
                }

                this.ctx.globalAlpha = node.baseAlpha * progress;
                this.ctx.font = node.font;
                this.ctx.fillStyle = node.color;

                // Tech glow optimization (only on bright whites)
                if (node.color === '#ffffff') {
                    this.ctx.shadowBlur = 6 * progress;
                    this.ctx.shadowColor = '#ffffff';
                } else {
                    // Turn off shadow blur to significantly boost frame rendering smoothness
                    this.ctx.shadowBlur = 0;
                }

                this.ctx.fillText(node.char, dx, dy);
            }
        }

        // Smoothly falling ASCII particles
        if (this.animationTime > 3000) {
            if (Math.random() < 0.05) {
                const leaves = this.nodes.filter(n => n.type === 'leaf');
                if (leaves.length > 0) {
                    const randomLeaf = leaves[Math.floor(Math.random() * leaves.length)];
                    this.particles.push({
                        x: randomLeaf.x,
                        y: randomLeaf.y,
                        char: this.charPool[Math.floor(Math.random() * this.charPool.length)],
                        color: randomLeaf.color,
                        font: randomLeaf.font,
                        vx: -0.4 + Math.random() * 0.2, // Drifting left
                        vy: 0.6 + Math.random() * 0.4,  // Gentle fall rate
                        r: 0,
                        vr: 0,
                        life: 300 + Math.random() * 300,
                        maxLife: 600
                    });
                }
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            p.vx += Math.sin(this.animationTime / 800 + p.y / 50) * 0.003;
            p.life -= dt * 0.15;

            if (Math.random() < 0.08) {
                p.char = this.charPool[Math.floor(Math.random() * this.charPool.length)];
            }

            const alpha = Math.max(0, (p.life / p.maxLife));

            this.ctx.globalAlpha = alpha * 0.7;
            this.ctx.font = p.font;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = p.color === '#ffffff' ? 4 : 0;
            if (this.ctx.shadowBlur > 0) this.ctx.shadowColor = p.color;

            this.ctx.fillText(p.char, p.x, p.y);

            if (p.life <= 0 || p.y > h + 20) {
                this.particles.splice(i, 1);
            }
        }

        this.rafId = requestAnimationFrame(this.renderLoop);
    };
}

export const ASCIITreeAnimation: React.FC<ASCIITreeProps> = ({
    studentName,
    autoPlay = true
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const treeRef = useRef<DenseASCIITree | null>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Extract container bounds for dynamic Hi-DPI setup
        const rect = containerRef.current.getBoundingClientRect();
        const logicalWidth = rect.width;
        // Make height proportional or use the fixed height of container
        const logicalHeight = rect.height;

        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;

        // CSS properties for scaling down the huge native canvas
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }

        const tree = new DenseASCIITree(canvas, studentName, logicalWidth, logicalHeight);
        treeRef.current = tree;

        if (autoPlay) {
            tree.start();
            setIsPlaying(true);
        }

        return () => {
            tree.stop();
        };
    }, [studentName, autoPlay]);

    const handleTogglePlay = () => {
        if (!treeRef.current) return;
        if (isPlaying) {
            treeRef.current.stop();
        } else {
            // Technically resuming logic is missing in new class, 
            // but we can just restart for full visual impact
            treeRef.current.start();
        }
        setIsPlaying(!isPlaying);
    };

    const handleReplay = () => {
        if (!treeRef.current) return;
        treeRef.current.stop();
        treeRef.current.start();
        setIsPlaying(true);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[400px] lg:h-[450px] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-xl group"
        >
            {/* Background Glow specifically for the tree */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Ground Line */}
            <div className="absolute bottom-[20px] left-8 right-8 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />

            <canvas
                ref={canvasRef}
                style={{ imageRendering: 'crisp-edges' }}
                className="absolute inset-0"
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2.5 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all text-neutral-900 dark:text-neutral-100 backdrop-blur-md shadow-sm"
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                    type="button"
                    onClick={handleReplay}
                    className="p-2.5 bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all text-neutral-900 dark:text-neutral-100 backdrop-blur-md shadow-sm"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div className="absolute top-4 left-4 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm opacity-80">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">ASCII Architecture</span>
            </div>
        </div>
    );
};

export default ASCIITreeAnimation;
