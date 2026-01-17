/**
 * SkeletonLoader Component
 * Loading skeleton dengan shimmer animation untuk dark theme
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

export interface SkeletonLoaderProps {
    variant: 'card' | 'list' | 'text' | 'circle' | 'avatar' | 'button';
    count?: number;
    className?: string;
    animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant,
    count = 1,
    className,
    animated = true,
}) => {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    return (
        <>
            {skeletons.map(index => (
                <SkeletonItem
                    key={index}
                    variant={variant}
                    className={className}
                    animated={animated}
                />
            ))}
        </>
    );
};

export default SkeletonLoader;

/**
 * SkeletonItem Component
 * Individual skeleton item
 */
interface SkeletonItemProps {
    variant: 'card' | 'list' | 'text' | 'circle' | 'avatar' | 'button';
    className?: string;
    animated?: boolean;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ variant, className, animated }) => {
    const baseClasses = 'bg-gray-800/50 relative overflow-hidden';

    const shimmerClasses = animated
        ? 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer'
        : '';

    switch (variant) {
        case 'card':
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                        baseClasses,
                        shimmerClasses,
                        'rounded-xl p-6 space-y-4',
                        className
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-700/50 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-700/50 rounded w-3/4" />
                            <div className="h-4 bg-gray-700/50 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700/50 rounded w-full" />
                        <div className="h-4 bg-gray-700/50 rounded w-5/6" />
                        <div className="h-4 bg-gray-700/50 rounded w-4/6" />
                    </div>
                    <div className="h-2 bg-gray-700/50 rounded-full w-full" />
                </motion.div>
            );

        case 'list':
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                        baseClasses,
                        shimmerClasses,
                        'rounded-lg p-4 flex items-center gap-4',
                        className
                    )}
                >
                    <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
                        <div className="h-3 bg-gray-700/50 rounded w-1/2" />
                    </div>
                </motion.div>
            );

        case 'text':
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn('space-y-2', className)}
                >
                    <div className={cn(baseClasses, shimmerClasses, 'h-4 rounded w-full')} />
                    <div className={cn(baseClasses, shimmerClasses, 'h-4 rounded w-5/6')} />
                    <div className={cn(baseClasses, shimmerClasses, 'h-4 rounded w-4/6')} />
                </motion.div>
            );

        case 'circle':
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        baseClasses,
                        shimmerClasses,
                        'w-20 h-20 rounded-full',
                        className
                    )}
                />
            );

        case 'avatar':
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn('flex items-center gap-3', className)}
                >
                    <div
                        className={cn(
                            baseClasses,
                            shimmerClasses,
                            'w-12 h-12 rounded-full'
                        )}
                    />
                    <div className="flex-1 space-y-2">
                        <div className={cn(baseClasses, shimmerClasses, 'h-4 rounded w-32')} />
                        <div className={cn(baseClasses, shimmerClasses, 'h-3 rounded w-24')} />
                    </div>
                </motion.div>
            );

        case 'button':
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                        baseClasses,
                        shimmerClasses,
                        'h-10 rounded-lg w-32',
                        className
                    )}
                />
            );

        default:
            return null;
    }
};

/**
 * SkeletonGrid Component
 * Grid of skeleton cards
 */
export interface SkeletonGridProps {
    count?: number;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
    count = 6,
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
        <div className={cn('grid gap-6', gridClasses[columns], className)}>
            <SkeletonLoader variant="card" count={count} />
        </div>
    );
};

/**
 * SkeletonTable Component
 * Table skeleton
 */
export interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
    rows = 5,
    columns = 4,
    className,
}) => {
    return (
        <div className={cn('space-y-3', className)}>
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-10 bg-gray-800/50 rounded-lg relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer"
                    />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <motion.div
                    key={rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    className="flex gap-4"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="flex-1 h-12 bg-gray-800/50 rounded-lg relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer"
                        />
                    ))}
                </motion.div>
            ))}
        </div>
    );
};

/**
 * SkeletonPage Component
 * Full page skeleton
 */
export const SkeletonPage: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="h-12 bg-gray-800/50 rounded-lg w-1/3 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer" />
                <div className="h-6 bg-gray-800/50 rounded w-2/3 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer" />
            </div>

            {/* Content */}
            <SkeletonGrid count={6} columns={3} />
        </div>
    );
};

/**
 * SkeletonText Component
 * Text skeleton with custom lines
 */
export interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className }) => {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                        'h-4 bg-gray-800/50 rounded relative overflow-hidden',
                        'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-shimmer',
                        i === lines - 1 ? 'w-2/3' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
};
