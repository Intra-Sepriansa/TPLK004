/**
 * DarkContainer Component
 * Container wrapper dengan dark theme styling, optional gradient border, dan glow effects
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface DarkContainerProps {
    children: React.ReactNode;
    className?: string;
    withGradientBorder?: boolean;
    glowEffect?: 'purple' | 'pink' | 'blue' | 'multi' | 'none';
    variant?: 'primary' | 'secondary' | 'tertiary';
    animated?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const DarkContainer = React.forwardRef<HTMLDivElement, DarkContainerProps>(
    (
        {
            children,
            className,
            withGradientBorder = false,
            glowEffect = 'none',
            variant = 'primary',
            animated = false,
            padding = 'lg',
            rounded = 'lg',
            ...props
        },
        ref
    ) => {
        // Background variants
        const backgroundVariants = {
            primary: 'bg-[#000000]',
            secondary: 'bg-[#0a0a0a]',
            tertiary: 'bg-[#1a1a1a]',
        };

        // Padding variants
        const paddingVariants = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-12',
        };

        // Rounded variants
        const roundedVariants = {
            none: '',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            full: 'rounded-full',
        };

        // Glow effect classes
        const glowClasses = {
            purple: 'glow-purple',
            pink: 'glow-pink',
            blue: 'glow-blue',
            multi: 'glow-multi',
            none: '',
        };

        // Gradient border classes
        const gradientBorderClass = withGradientBorder
            ? 'gradient-border-purple'
            : 'border border-white/10';

        // Base classes
        const baseClasses = cn(
            backgroundVariants[variant],
            paddingVariants[padding],
            roundedVariants[rounded],
            gradientBorderClass,
            glowClasses[glowEffect],
            'text-[#f5f5f5]',
            'transition-all duration-300',
            className
        );

        // If animated, use motion.div
        if (animated) {
            return (
                <motion.div
                    ref={ref}
                    className={baseClasses}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    {...props}
                >
                    {children}
                </motion.div>
            );
        }

        // Regular div
        return (
            <div ref={ref} className={baseClasses} {...props}>
                {children}
            </div>
        );
    }
);

DarkContainer.displayName = 'DarkContainer';

export default DarkContainer;

/**
 * DarkContainerWithGlass Component
 * DarkContainer dengan glassmorphism effect
 */
export interface DarkContainerWithGlassProps extends DarkContainerProps {
    glassStrength?: 'normal' | 'strong';
}

export const DarkContainerWithGlass = React.forwardRef<
    HTMLDivElement,
    DarkContainerWithGlassProps
>(
    (
        {
            children,
            className,
            glassStrength = 'normal',
            glowEffect = 'none',
            animated = false,
            padding = 'lg',
            rounded = 'lg',
            ...props
        },
        ref
    ) => {
        const glassClass = glassStrength === 'strong' ? 'glass-strong' : 'glass';

        const glowClasses = {
            purple: 'glow-purple',
            pink: 'glow-pink',
            blue: 'glow-blue',
            multi: 'glow-multi',
            none: '',
        };

        const paddingVariants = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
            xl: 'p-12',
        };

        const roundedVariants = {
            none: '',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            full: 'rounded-full',
        };

        const baseClasses = cn(
            glassClass,
            paddingVariants[padding],
            roundedVariants[rounded],
            glowClasses[glowEffect],
            'text-[#f5f5f5]',
            'transition-all duration-300',
            className
        );

        if (animated) {
            return (
                <motion.div
                    ref={ref}
                    className={baseClasses}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    {...props}
                >
                    {children}
                </motion.div>
            );
        }

        return (
            <div ref={ref} className={baseClasses} {...props}>
                {children}
            </div>
        );
    }
);

DarkContainerWithGlass.displayName = 'DarkContainerWithGlass';

/**
 * DarkSection Component
 * Full-width dark section wrapper
 */
export interface DarkSectionProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'tertiary';
    withPattern?: boolean;
}

export const DarkSection = React.forwardRef<HTMLElement, DarkSectionProps>(
    ({ children, className, variant = 'primary', withPattern = false }, ref) => {
        const backgroundVariants = {
            primary: 'bg-[#000000]',
            secondary: 'bg-[#0a0a0a]',
            tertiary: 'bg-[#1a1a1a]',
        };

        const patternClass = withPattern ? 'bg-grid-slate' : '';

        return (
            <section
                ref={ref}
                className={cn(
                    backgroundVariants[variant],
                    patternClass,
                    'text-[#f5f5f5]',
                    'w-full',
                    className
                )}
            >
                {children}
            </section>
        );
    }
);

DarkSection.displayName = 'DarkSection';
