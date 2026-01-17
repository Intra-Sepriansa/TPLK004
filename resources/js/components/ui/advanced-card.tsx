/**
 * AdvancedCard Component
 * Card dengan glassmorphism, interactive effects, dan glow animations
 */

import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

export interface AdvancedCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    progress?: number;
    onClick?: () => void;
    variant?: 'default' | 'gradient' | 'glow';
    className?: string;
    badge?: string;
    footer?: React.ReactNode;
    image?: string;
    hoverEffect?: boolean;
}

const AdvancedCard = React.forwardRef<HTMLDivElement, AdvancedCardProps>(
    (
        {
            title,
            description,
            icon,
            progress,
            onClick,
            variant = 'default',
            className,
            badge,
            footer,
            image,
            hoverEffect = true,
        },
        ref
    ) => {
        const cardRef = useRef<HTMLDivElement>(null);
        
        // Mouse position tracking for tilt effect
        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);
        
        const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
            stiffness: 300,
            damping: 30,
        });
        const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
            stiffness: 300,
            damping: 30,
        });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current || !hoverEffect) return;
            
            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            mouseX.set((e.clientX - centerX) / rect.width);
            mouseY.set((e.clientY - centerY) / rect.height);
        };

        const handleMouseLeave = () => {
            mouseX.set(0);
            mouseY.set(0);
        };

        // Variant styles
        const variantClasses = {
            default: 'glass border-white/10',
            gradient: 'gradient-border-purple glass',
            glow: 'glass border-white/10 hover-glow-purple',
        };

        const cardClasses = cn(
            'relative overflow-hidden rounded-xl',
            'p-6',
            'cursor-pointer',
            'transition-all duration-300',
            variantClasses[variant],
            hoverEffect && 'hover-lift',
            className
        );

        return (
            <motion.div
                ref={ref}
                className={cardClasses}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={
                    hoverEffect
                        ? {
                              y: -4,
                              transition: { duration: 0.3 },
                          }
                        : undefined
                }
                style={
                    hoverEffect
                        ? {
                              rotateX,
                              rotateY,
                              transformStyle: 'preserve-3d',
                          }
                        : undefined
                }
            >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />

                {/* Image */}
                {image && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                )}

                {/* Badge */}
                {badge && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="absolute top-4 right-4 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium"
                    >
                        {badge}
                    </motion.div>
                )}

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-3">
                        {icon && (
                            <motion.div
                                className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 text-white"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                {icon}
                            </motion.div>
                        )}
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 font-display">
                                {title}
                            </h3>
                            
                            {progress !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <span>{progress}% Complete</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                        {description}
                    </p>

                    {/* Progress Bar */}
                    {progress !== undefined && (
                        <div className="mb-4">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    {footer && (
                        <div className="pt-4 border-t border-white/10">
                            {footer}
                        </div>
                    )}
                </div>

                {/* Hover shine effect */}
                <motion.div
                    className="absolute inset-0 opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                </motion.div>
            </motion.div>
        );
    }
);

AdvancedCard.displayName = 'AdvancedCard';

export default AdvancedCard;

/**
 * AdvancedCardGrid Component
 * Grid layout untuk AdvancedCard dengan stagger animation
 */
export interface AdvancedCardGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export const AdvancedCardGrid: React.FC<AdvancedCardGridProps> = ({
    children,
    columns = 3,
    className,
}) => {
    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <motion.div
            className={cn('grid gap-6', gridClasses[columns], className)}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * CompactCard Component
 * Compact version of AdvancedCard
 */
export interface CompactCardProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    active?: boolean;
}

export const CompactCard: React.FC<CompactCardProps> = ({
    title,
    subtitle,
    icon,
    onClick,
    className,
    active = false,
}) => {
    return (
        <motion.div
            className={cn(
                'relative p-4 rounded-lg',
                'glass border-white/10',
                'cursor-pointer',
                'transition-all duration-300',
                'hover-lift hover-glow-purple',
                active && 'border-purple-500/50 bg-purple-500/10',
                className
            )}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white">
                        {icon}
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{title}</h4>
                    {subtitle && (
                        <p className="text-white/60 text-sm truncate">{subtitle}</p>
                    )}
                </div>

                {/* Arrow icon */}
                <svg
                    className="w-5 h-5 text-white/40 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </div>
        </motion.div>
    );
};

/**
 * StatCard Component
 * Card untuk menampilkan statistik
 */
export interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    className,
}) => {
    return (
        <motion.div
            className={cn(
                'relative p-6 rounded-xl',
                'glass border-white/10',
                'hover-lift hover-glow-blue',
                className
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="text-white/60 text-sm font-medium">{label}</div>
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2 text-white">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white font-display">
                    {value}
                </div>

                {trend && (
                    <div
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            trend.direction === 'up'
                                ? 'text-green-400'
                                : 'text-red-400'
                        )}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                    trend.direction === 'up'
                                        ? 'M5 10l7-7m0 0l7 7m-7-7v18'
                                        : 'M19 14l-7 7m0 0l-7-7m7 7V3'
                                }
                            />
                        </svg>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
