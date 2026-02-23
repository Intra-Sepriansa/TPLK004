import React from 'react';
import { motion } from 'framer-motion';

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
    className = ''
}) => {
    return (
        <div className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all ${colorClass} dark:border-white/5 ${className}`}>
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none`} />

            {/* Animated Glow Sphere */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${glowClass} blur-3xl pointer-events-none`}
            />

            {/* Content Context */}
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    );
};
