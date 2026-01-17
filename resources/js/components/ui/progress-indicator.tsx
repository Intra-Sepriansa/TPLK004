/**
 * ProgressIndicator Component
 * Circular progress bar dengan gradient, animations, dan celebration effects
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ProgressIndicatorProps {
    value: number; // 0-100
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showLabel?: boolean;
    gradient?: boolean;
    animated?: boolean;
    className?: string;
    label?: string;
    showPercentage?: boolean;
    celebrateOnComplete?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    value,
    size = 'md',
    showLabel = true,
    gradient = true,
    animated = true,
    className,
    label,
    showPercentage = true,
    celebrateOnComplete = true,
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    // Size configurations
    const sizeConfig = {
        sm: { size: 60, strokeWidth: 4, fontSize: 'text-xs' },
        md: { size: 80, strokeWidth: 6, fontSize: 'text-sm' },
        lg: { size: 120, strokeWidth: 8, fontSize: 'text-lg' },
        xl: { size: 160, strokeWidth: 10, fontSize: 'text-2xl' },
    };

    const config = sizeConfig[size];
    const radius = (config.size - config.strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (displayValue / 100) * circumference;

    // Animate value change
    useEffect(() => {
        if (animated) {
            const duration = 1000;
            const steps = 60;
            const increment = (value - displayValue) / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                setDisplayValue(prev => {
                    const newValue = prev + increment;
                    if (currentStep >= steps) {
                        clearInterval(timer);
                        return value;
                    }
                    return newValue;
                });
            }, duration / steps);

            return () => clearInterval(timer);
        } else {
            setDisplayValue(value);
        }
    }, [value, animated]);

    // Check completion
    useEffect(() => {
        if (displayValue >= 100 && !isComplete) {
            setIsComplete(true);
            if (celebrateOnComplete) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 2000);
            }
        } else if (displayValue < 100 && isComplete) {
            setIsComplete(false);
        }
    }, [displayValue, isComplete, celebrateOnComplete]);

    return (
        <div className={cn('relative inline-flex flex-col items-center', className)}>
            {/* SVG Progress Circle */}
            <div className="relative">
                <svg
                    width={config.size}
                    height={config.size}
                    className="transform -rotate-90"
                >
                    {/* Background Circle */}
                    <circle
                        cx={config.size / 2}
                        cy={config.size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        className="text-gray-200 dark:text-gray-900"
                    />

                    {/* Progress Circle */}
                    <motion.circle
                        cx={config.size / 2}
                        cy={config.size / 2}
                        r={radius}
                        stroke={gradient ? 'url(#gradient)' : 'currentColor'}
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={gradient ? '' : 'text-purple-500'}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{
                            duration: 1,
                            ease: 'easeOut',
                        }}
                    />

                    {/* Gradient Definition */}
                    {gradient && (
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="50%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    )}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {isComplete ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="flex items-center justify-center w-full h-full"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        </motion.div>
                    ) : (
                        showPercentage && (
                            <motion.div
                                key={Math.floor(displayValue)}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn(
                                    'font-bold text-gray-900 dark:text-white font-display',
                                    config.fontSize
                                )}
                            >
                                {Math.round(displayValue)}%
                            </motion.div>
                        )
                    )}
                </div>

                {/* Celebration Confetti */}
                {showCelebration && (
                    <>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                style={{
                                    background: `hsl(${i * 45}, 70%, 60%)`,
                                }}
                                initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                animate={{
                                    x: Math.cos((i * Math.PI) / 4) * 50,
                                    y: Math.sin((i * Math.PI) / 4) * 50,
                                    opacity: 0,
                                    scale: 0,
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Glow Effect */}
                {isComplete && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(168, 85, 247, 0.5)',
                                '0 0 40px rgba(168, 85, 247, 0.3)',
                                '0 0 20px rgba(168, 85, 247, 0.5)',
                            ],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                )}
            </div>

            {/* Label */}
            {showLabel && label && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 text-center"
                >
                    <div className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{label}</div>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-1 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-medium"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Completed!</span>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ProgressIndicator;

/**
 * LinearProgressBar Component
 * Linear progress bar variant
 */
export interface LinearProgressBarProps {
    value: number;
    className?: string;
    gradient?: boolean;
    animated?: boolean;
    showLabel?: boolean;
    height?: 'sm' | 'md' | 'lg';
}

export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
    value,
    className,
    gradient = true,
    animated = true,
    showLabel = false,
    height = 'md',
}) => {
    const heightClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Progress</span>
                    <span className="text-gray-900 dark:text-white font-semibold text-sm">{value}%</span>
                </div>
            )}
            <div className={cn('w-full bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner', heightClasses[height])}>
                <motion.div
                    className={cn(
                        'h-full rounded-full',
                        gradient
                            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500'
                            : 'bg-purple-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                        duration: animated ? 1 : 0,
                        ease: 'easeOut',
                    }}
                />
            </div>
        </div>
    );
};

/**
 * ProgressBadge Component
 * Compact progress badge
 */
export interface ProgressBadgeProps {
    value: number;
    className?: string;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({ value, className }) => {
    const isComplete = value >= 100;

    return (
        <motion.div
            className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
                'glass border border-white/10',
                isComplete && 'border-purple-500/50 bg-purple-500/10',
                className
            )}
            whileHover={{ scale: 1.05 }}
        >
            <div className="relative w-4 h-4">
                <svg className="w-4 h-4 transform -rotate-90">
                    <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-white/20"
                    />
                    <motion.circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={37.7}
                        strokeDashoffset={37.7 - (value / 100) * 37.7}
                        className="text-purple-500"
                        initial={{ strokeDashoffset: 37.7 }}
                        animate={{ strokeDashoffset: 37.7 - (value / 100) * 37.7 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
            </div>
            <span className="text-white text-sm font-medium">{value}%</span>
            {isComplete && <Check className="w-4 h-4 text-purple-400" />}
        </motion.div>
    );
};
