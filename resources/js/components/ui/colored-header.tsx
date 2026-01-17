/**
 * ColoredHeader Component
 * Header dengan gradient color, interactive elements, dan sticky behavior
 */

import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export interface ColoredHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    gradient?: 'purple' | 'blue' | 'multi' | 'sunset' | 'ocean' | 'midnight';
    sticky?: boolean;
    className?: string;
    onBack?: () => void;
    breadcrumbs?: React.ReactNode;
}

const ColoredHeader = React.forwardRef<HTMLDivElement, ColoredHeaderProps>(
    (
        {
            title,
            subtitle,
            actions,
            gradient = 'purple',
            sticky = false,
            className,
            onBack,
            breadcrumbs,
        },
        ref
    ) => {
        const [isScrolled, setIsScrolled] = useState(false);
        const { scrollY } = useScroll();
        
        // Transform scroll to backdrop blur
        const backdropBlur = useTransform(
            scrollY,
            [0, 100],
            ['blur(0px)', 'blur(12px)']
        );
        
        const backgroundColor = useTransform(
            scrollY,
            [0, 100],
            ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']
        );

        useEffect(() => {
            const handleScroll = () => {
                setIsScrolled(window.scrollY > 20);
            };

            if (sticky) {
                window.addEventListener('scroll', handleScroll);
                return () => window.removeEventListener('scroll', handleScroll);
            }
        }, [sticky]);

        // Gradient variants
        const gradientVariants = {
            purple: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600',
            blue: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600',
            multi: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600',
            sunset: 'bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600',
            ocean: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600',
            midnight: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900',
        };

        const headerClasses = cn(
            'relative w-full',
            sticky && 'sticky top-0 z-50',
            'transition-all duration-300',
            className
        );

        const contentClasses = cn(
            gradientVariants[gradient],
            'animate-gradient-shift',
            'px-6 py-8',
            'transition-all duration-300',
            isScrolled && sticky && 'py-4'
        );

        return (
            <motion.div
                ref={ref}
                className={headerClasses}
                style={
                    sticky && isScrolled
                        ? {
                              backdropFilter: backdropBlur,
                              backgroundColor: backgroundColor,
                          }
                        : undefined
                }
            >
                <div className={contentClasses}>
                    <div className="container mx-auto">
                        {/* Breadcrumbs */}
                        {breadcrumbs && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-4"
                            >
                                {breadcrumbs}
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                {/* Back Button */}
                                {onBack && (
                                    <motion.button
                                        onClick={onBack}
                                        className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                                        whileHover={{ x: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        <span>Back</span>
                                    </motion.button>
                                )}

                                {/* Title */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className={cn(
                                        'text-white font-bold font-display',
                                        isScrolled && sticky ? 'text-2xl' : 'text-4xl',
                                        'transition-all duration-300'
                                    )}
                                >
                                    {title}
                                </motion.h1>

                                {/* Subtitle */}
                                {subtitle && !isScrolled && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.2 }}
                                        className="mt-2 text-white/80 text-lg"
                                    >
                                        {subtitle}
                                    </motion.p>
                                )}
                            </div>

                            {/* Actions */}
                            {actions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="flex items-center gap-3"
                                >
                                    {actions}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>
        );
    }
);

ColoredHeader.displayName = 'ColoredHeader';

export default ColoredHeader;

/**
 * HeaderNavItem Component
 * Interactive navigation item untuk header
 */
export interface HeaderNavItemProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}

export const HeaderNavItem: React.FC<HeaderNavItemProps> = ({
    label,
    active = false,
    onClick,
    icon,
}) => {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'relative px-4 py-2 rounded-lg',
                'text-white font-medium',
                'transition-all duration-300',
                active
                    ? 'bg-white/20'
                    : 'bg-white/5 hover:bg-white/10'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="flex items-center gap-2">
                {icon && <span className="w-5 h-5">{icon}</span>}
                <span>{label}</span>
            </div>

            {/* Active indicator */}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            )}

            {/* Hover glow */}
            <motion.div
                className="absolute inset-0 rounded-lg bg-white/0"
                whileHover={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
};

/**
 * HeaderActionButton Component
 * Action button untuk header
 */
export interface HeaderActionButtonProps {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
}

export const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
    label,
    icon,
    onClick,
    variant = 'primary',
}) => {
    const variantClasses = {
        primary: 'bg-white text-purple-600 hover:bg-white/90',
        secondary: 'bg-white/20 text-white hover:bg-white/30',
        ghost: 'bg-transparent text-white hover:bg-white/10',
    };

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'px-4 py-2 rounded-lg font-medium',
                'transition-all duration-300',
                'flex items-center gap-2',
                variantClasses[variant]
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            {label && <span>{label}</span>}
        </motion.button>
    );
};
