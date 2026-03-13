import { motion } from 'framer-motion';
import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    colorClass: string;
    gradientClass: string;
    glowClass: string;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    colorClass,
    gradientClass,
    glowClass,
    className = '',
}) => {
    return (
        <div
            className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:bg-neutral-900/40 ${colorClass} dark:border-white/5 ${className}`}
        >
            {/* Gradient Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientClass} pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-100`}
            />

            {/* Animated Glow Sphere */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${glowClass} pointer-events-none blur-3xl`}
            />

            {/* Content Context */}
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};
