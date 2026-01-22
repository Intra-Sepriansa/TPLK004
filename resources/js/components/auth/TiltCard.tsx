import { useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    intensity?: number;
}

export function TiltCard({ children, className, intensity = 15 }: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * intensity;
        const rotateY = ((centerX - x) / centerX) * intensity;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setGlare({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: 0.3,
        });
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setGlare({ x: 50, y: 50, opacity: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn('relative transition-transform duration-300 ease-out', className)}
            style={{ transform, transformStyle: 'preserve-3d' }}
        >
            {/* Glare effect */}
            <div
                className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 50%)`,
                }}
            />
            {children}
        </div>
    );
}
